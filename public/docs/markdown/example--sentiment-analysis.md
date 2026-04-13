# Sentiment analysis

## Before you start

```bash
pip install volnux textblob matplotlib yagmail python-dotenv
```

Copy `.env.example` to `.env` and set `SENDER_EMAIL`, `SENDER_PASSWORD`, `RECIPIENT_EMAIL` if you want email branches to work.

## 1. Pipeline and fields (`sentiment_analysis_pipeline.py`)

`FileInputDataField` points at `posts_comments.json`. Email fields read from environment when not passed explicitly. The graph lives in `Meta.pointy` (you can switch to `Meta.file` + `pointy_file.pty` instead).

```python
import os

from volnux.pipeline import Pipeline
from volnux.fields import FileInputDataField, InputDataField


class SentimentAnalysisPipeline(Pipeline):
    """
    A pipeline for running sentiment analysis on data.


    Attributes:
        posts_comments_file (FileInputDataField): The path to the JSON file containing post comments.
        sender_email (InputDataField): The email address to send the email notification.
        recipient_email (InputDataField): The recipient email address for the email notification.
        sender_password (InputDataField): The email password or app-specific password.


    """

    posts_comments_file = FileInputDataField(
        path="posts_comments.json",
        required=False,
        help_text="The path to the JSON file containing post comments.",
    )
    sender_email = InputDataField(
        required=False,
        default_factory=lambda: os.getenv("SENDER_EMAIL"),
        help_text="The email address to send the email notification.",
    )
    sender_password = InputDataField(
        required=False,
        default_factory=lambda: os.getenv("SENDER_PASSWORD"),
        help_text="The email password or app-specific password.",
    )
    recipient_email = InputDataField(
        required=False,
        default_factory=lambda: os.getenv("RECIPIENT_EMAIL"),
        help_text="The recipient email address for the email notification.",
    )

    class Meta:
        pointy = "LoadData ( 1 |-> ProcessData |-> AnalyzeSentiment |-> PlotStackedSentiments, 0 |-> DataFileJsonError, 2 |-> NotifyDataFileMissing )"
        # Path to the pointy file, if u choose to execute with it
        # file = "sentiment_analysis/pointy_file.pty"
```


## 2. Pointy file (optional external graph)

Same structure as `Meta.pointy`, kept as a separate `.pty` for readability:

```text
LoadData (
1 |-> ProcessData |-> AnalyzeSentiment |-> PlotStackedSentiments,
0 |-> DataFileJsonError,
2 |-> NotifyDataFileMissing
)
```


## 3. Event logic (`events.py`)

**LoadData** reads JSON; if the file is missing it uses `goto(descriptor=2, …)` to jump the flow to **NotifyDataFileMissing**. JSON errors go to **DataFileJsonError**. **ProcessData** narrows fields; **AnalyzeSentiment** scores bodies; **PlotStackedSentiments** renders a stacked bar chart.

```python
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from pathlib import Path

from volnux import EventBase
import json
from typing import List, Tuple, Dict, Any, Union
from textblob import TextBlob
import matplotlib.pyplot as plt
from volnux.base import RetryPolicy
from .custom_exceptions import DataFileError, EmailNotificationError, JsonDataError
import yagmail
import traceback

# Get the directory of the current module
module_dir = Path(__file__).parent
# Construct the path to posts_comments.json
comments_file_path = module_dir / "posts_comments.json"


class LoadData(EventBase):
    """
    Event that loads data from a file and returns the data to other events in the pipeline.
    """

    executor = ThreadPoolExecutor
    retry_policy = RetryPolicy(
        max_attempts=3,
        backoff_factor=0.005,
        max_backoff=100,
        retry_on_exceptions=[JsonDataError, DataFileError],
    )

    def process(
        self, file_path: Path = comments_file_path
    ) -> Union[Tuple[bool, List[Dict[str, Any]]], Tuple[bool, str]]:
        """
        Reads posts data from a local JSON file.

        Args:
            file_path (str): Path to the JSON file containing post data.

        Returns:
            Tuple[bool, List[Dict[str, Any]]]: A success flag and the list of post dictionaries.
        """
        if not file_path.exists():
            self.goto(
                descriptor=2,
                reason="Failed to read data file, no file was provided.",
                result_status=False,
                result=None,
            )
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                data: List[Dict[str, Any]] = json.load(file)
        except json.JSONDecodeError:
            error_trace = traceback.format_exc()
            return False, error_trace

        return True, data


class ProcessData(EventBase):
    """
    Class that processes the data returned by LoadData.

    This class is responsible for filtering out posts to only include the postId and body.
    """

    executor = ProcessPoolExecutor

    def process(self) -> Tuple[bool, List[Dict]]:
        """
        Filters posts to include only postId and body, and returns them.

        Returns:
            Tuple[bool, List[Dict]]: A success flag and the filtered list of post dictionaries.
        """
        posts = self.previous_result[0].content  # List[Dict]
        filtered_posts_with_bodies = [
            {"postId": item["postId"], "body": item["body"]} for item in posts
        ]
        return True, filtered_posts_with_bodies


class AnalyzeSentiment(EventBase):
    """
    Event that performs sentiment analysis on posts using TextBlob.

    This event is a container for other events that analyze sentiment.
    """

    executor = ProcessPoolExecutor

    def process(self) -> Tuple[bool, Dict[int, Dict[str, int]]]:
        """
        Performs sentiment analysis on post bodies using TextBlob and groups results by postId.

        Returns:
            Tuple[bool, Dict[int, Dict[str, int]]]: A success flag and a dictionary with postId as keys
            and counts of positive and negative sentiments as values.
        """
        posts = self.previous_result[0].content  # List[Dict] with postId and body
        sentiment_results = {
            post["postId"]: {"positive": 0, "negative": 0} for post in posts
        }

        for post in posts:
            post_id = post["postId"]
            body = post["body"]
            analysis = TextBlob(body)
            polarity = analysis.sentiment.polarity
            # Consider polarity > 0 as positive, <= 0 as negative
            sentiment_results[post_id]["positive" if polarity > 0 else "negative"] += 1

        return True, sentiment_results


class PlotStackedSentiments(EventBase):
    """
    Event that creates a stacked bar chart of positive and negative sentiment counts for each postId.
    """

    executor = ProcessPoolExecutor

    def process(self) -> Tuple[bool, None]:
        """
        Creates a stacked bar chart of positive and negative sentiment counts for each postId.

        Returns:
            Tuple[bool, None]: A success flag and None (plot is displayed).
        """
        sentiment_data = self.previous_result[0].content  # Dict[int, Dict[str, int]]

        post_ids = list(sentiment_data.keys())
        positive_counts = [sentiment_data[pid]["positive"] for pid in post_ids]
        negative_counts = [sentiment_data[pid]["negative"] for pid in post_ids]

        fig, ax = plt.subplots(figsize=(12, 6))

        ax.bar(post_ids, positive_counts, label="Positive", color="green")
        ax.bar(
            post_ids,
            negative_counts,
            bottom=positive_counts,
            label="Negative",
            color="red",
        )

        ax.set_xlabel("Post ID")
        ax.set_ylabel("Sentiment Count")
        ax.set_title("Stacked Sentiment Counts by Post ID")
        ax.set_xticks(post_ids)
        ax.set_xticklabels(post_ids, rotation=45)
        ax.legend()

        plt.tight_layout()
        plt.show()

        return True, None


class NotifyDataFileMissing(EventBase):
    """
    Event that sends an email notification when the data file is missing.
    """

    executor = ThreadPoolExecutor
    retry_policy = RetryPolicy(
        max_attempts=3,
        backoff_factor=0.005,
        max_backoff=100,
        retry_on_exceptions=[EmailNotificationError],
    )

    def process(
        self,
        sender_email: str,
        sender_password: str,
        recipient_email: str,
    ) -> Tuple[bool, str]:
        """
        Sends an email notification if the data file is not found.

        Args:
            sender_email (str): The email address to send the message from.
            sender_password (str): The email password or app-specific password.
            recipient_email (str): The recipient email address.

        Returns:
            Tuple[bool, str]: A flag indicating if the email was sent, and a message.
        """
        subject = f"Data file not found"
        body = (
            "The data file required for Sentiment Analysis could not be found.\n\n"
            "Please provide a correct data file and run the pipeline again.\n\n"
            "Thank you."
        )

        try:
            yag = yagmail.SMTP(user=sender_email, password=sender_password)
            yag.send(to=recipient_email, subject=subject, contents=body)
        except Exception as e:
            raise EmailNotificationError(f"Failed to send notification email: {e}")

        return True, "Data file found. No email sent."


class DataFileJsonError(EventBase):
    """
    Event that handles a JSONDecodeError when reading the data file.

    This event is used to handle a JSONDecodeError when reading the data file.
    The event will retry the operation up to 3 times with a short backoff period.
    """

    executor = ThreadPoolExecutor
    retry_policy = RetryPolicy(
        max_attempts=3,
        backoff_factor=0.005,
        max_backoff=100,
        retry_on_exceptions=[EmailNotificationError],
    )

    def process(
        self,
        sender_email: str,
        sender_password: str,
        recipient_email: str,
    ) -> Tuple[bool, str]:
        """
        Sends an email notification if the data file is not found.

        Args:
            file_path (Path): The path to the expected data file.
            sender_email (str): The email address to send the message from.
            sender_password (str): The email password or app-specific password.
            recipient_email (str): The recipient email address.

        Returns:
            Tuple[bool, str]: A flag indicating if the email was sent, and a message.
        """
        error_trace = self.previous_result[0].content
        subject = f"Json Data Error in  File"
        body = (
            "The data file contains invalid json format or json errors.\n\n"
            "Please check the error trace below and correct the file and run the pipeline again.\n\n"
            f"Error Trace: {error_trace}\n\n"
            "Thank you."
        )
        try:
            yag = yagmail.SMTP(user=sender_email, password=sender_password)
            yag.send(to=recipient_email, subject=subject, contents=body)
        except Exception as e:
            raise EmailNotificationError(f"Failed to send notification email: {e}")

        return True, "Data file found. No email sent."
```


## 4. Custom exceptions (`custom_exceptions.py`)

Used with `RetryPolicy` and error handling in events.

```python
from pathlib import Path


class DataFileError(Exception):
    """Custom exception for handling data file issues."""

    def __init__(self, message: str, file_path=None):
        self.message = message
        self.file_path = file_path
        super().__init__(self.message)

    def __str__(self):
        if self.file_path:
            return f"{self.message} (File: {self.file_path})"
        return self.message


class JsonDataError(Exception):
    """Raised when sending an email notification fails."""

    def __init__(
        self, message: str, original_exception: Exception = None, file_path: Path = None
    ):
        self.message = message
        self.original_exception = original_exception
        full_message = f"{message}  {file_path}"
        if original_exception:
            self.message += f" | Cause: {str(original_exception)}"
        super().__init__(full_message)


class EmailNotificationError(Exception):
    """Raised when sending an email notification fails."""

    def __init__(
        self, message: str, recipient: str = "", original_exception: Exception = None
    ):
        self.message = message
        self.recipient = recipient
        self.original_exception = original_exception
        full_message = f"{message} (Recipient: {recipient})"
        if original_exception:
            full_message += f" | Cause: {str(original_exception)}"
        super().__init__(full_message)
```


## 5. Sample input (`posts_comments.json`)

The repo ships a large sample; the excerpt below is enough to see the schema (`postId`, `body`, …).

```json
[
  {
    "postId": 1,
    "id": 1,
    "name": "On the Nature of Pleasure and Pain",
    "email": "eliseo@gardner.biz",
    "body": "The pursuit of pleasure is often seen as a great virtue, yet it is tempered by the necessities of life. Pain, though rejected by many, can lead to wisdom and understanding, for it is through struggle that we grow."
  },
  {
    "postId": 1,
    "id": 2,
    "name": "The Rejection of True Desires",
    "email": "jayne_kuhic@sydney.com",
    "body": "True pleasure is not born from indulgence but from discipline. Many are blinded by fleeting desires, yet wisdom lies in rejecting what is easy for what is enduring and meaningful."
  },
  {
    "postId": 1,
    "id": 3,
    "name": "The Pursuit of Virtuous Goals",
    "email": "nikita@garfield.biz",
    "body": "Some despise pain, yet it is through adversity that we find true delight. Wisdom guides us to embrace challenges, for they lead to greater pleasures and understanding."
  },
  {
    "postId": 1,
    "id": 4,
    "name": "The Balance of Pleasure and Duty",
    "email": "lew@alysha.tv",
    "body": "Pleasure and pain are intertwined, and those who seek only the former may find themselves lost. True virtue lies in balancing desire with duty, for wisdom emerges from this harmony."
  },
  {
    "postId": 1,
    "id": 5,
    "name": "The Path to True Contentment",
    "email": "hayden@althea.biz",
    "body": "Reason guides us away from fleeting pleasures toward lasting contentment. Those who flee from challenges may never know the joy of overcoming them."
  },
  {
    "postId": 2,
    "id": 6,
    "name": "The Pursuit of Meaningful Ends",
    "email": "presley.mueller@myrl.com",
    "body": "To pursue fleeting pleasures is to avoid true meaning. Rejecting pain in favor of wisdom leads to a life of purpose and fulfillment."
  },
  {
    "postId": 2,
    "id": 7,
    "name": "The Consequences of Seeking Pleasure",
    "email": "dallas@ole.me",
    "body": "The pursuit of pleasure often leads to unforeseen pain. Wisdom lies in choosing paths that balance immediate joy with lasting fulfillment."
  },
  {
    "postId": 2,
    "id": 8,
    "name": "The Nature of True Delight",
    "email": "mallory_kunze@marie.org",
    "body": "Pleasure can corrupt if not guided by reason. True delight comes from understanding and embracing the balance between joy and responsibility."
  },
  {
    "postId": 2,
    "id": 9,
    "name": "Wisdom in Seeking Pleasure",
    "email": "meghan_littel@rene.us",
    "body": "Wise individuals seek pleasure that aligns with virtue, avoiding the pitfalls of fleeting desires that lead to discomfort."
  },
  {
    "postId": 2,
    "id": 10,
    "name": "The Harmony of Duty and Desire",
    "email": "carmen_keeling@caroline.name",
    "body": "Pleasure pursued without regard for duty leads to emptiness. True fulfillment arises from aligning desires with moral purpose."
  },
  {
    "postId": 3,
    "id": 11,
    "name": "The Virtue of Enduring Pain",
    "email": "veronica_goodwin@timmothy.net",
    "body": "Pain, though often avoided, can be a path to growth. Those who endure it with purpose find greater joy in their achievements."
  },
  {
    "postId": 3,
    "id": 12,
    "name": "The Strength in Facing Challenges",
    "email": "oswald.vandervort@leanne.org",
    "body": "Challenges are the forge of character. By facing pain with courage, we uncover the strength to achieve true happiness."
  },
  {
    "postId": 3,
    "id": 13,
    "name": "The Wisdom of Rejecting Ease",
    "email": "kariane@jadyn.tv",
    "body": "To reject ease in favor of meaningful struggle is to embrace wisdom. True pleasure lies in overcoming obstacles."
  },
  {
    "postId": 3,
    "id": 14,
    "name": "The Pursuit of Lasting Joy",
    "email": "nathan@solon.io",
    "body": "Lasting joy is found not in fleeting pleasures but in the disciplined pursuit of meaningful goals, tempered by reason."
  },
  {
    "postId": 3,
    "id": 15,
    "name": "The Valu

… (truncated for web docs — see the full file under `examples/sentiment_analysis/posts_comments.json` in the repo)
```


## 6. Entry point (`__main__.py`)

Loads environment variables, draws graphs (needs **Graphviz** installed for `draw_graphviz_image`), then runs the pipeline.

```python
from .sentiment_analysis_pipeline import SentimentAnalysisPipeline
from dotenv import load_dotenv

load_dotenv()


pipeline = SentimentAnalysisPipeline()
pipeline.draw_ascii_graph() #visualize the ASCII graph
pipeline.draw_graphviz_image() #visualize the graph using graphviz
pipeline.start()
```


## 7. Run

```bash
cd examples/sentiment_analysis
python -m examples.sentiment_analysis
```

