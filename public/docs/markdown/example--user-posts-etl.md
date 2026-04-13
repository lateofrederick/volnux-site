# User posts ETL

## Before you start

```bash
pip install volnux httpx matplotlib
```

## 1. Pipeline (`etl_pipeline.py`)

A single `InputDataField` `url` defaults to JSONPlaceholder posts. `Meta.pointy` is a straight line: `LoadData |-> ProcessData |-> GraphData`.

```python
from volnux.pipeline import Pipeline
from volnux.fields import InputDataField
from volnux.signal.signals import pipeline_execution_start
from volnux.decorators import listener
from .events import LoadData, ProcessData, GraphData


class UserPostETLPipeline(Pipeline):
    """
    A pipeline for loading data, processing it, and visualizing it.

    Attributes:
        url (str): The URL of the data to load.

    """

    url = InputDataField(
        data_type=str,
        required=True,
        default="https://jsonplaceholder.typicode.com/posts",
    )

    class Meta:
        pointy = "LoadData |-> ProcessData |-> GraphData"
        # Path to the pointy file, if u choose to execute with it
        # file = "eventpipelines/userspost_ptr.pty"
```


## 2. Pointy file (`userspost_ptr.pty`)

Equivalent one-liner if you prefer loading from file:

```text
LoadData |-> ProcessData |-> GraphData
```


## 3. Events (`events.py`)

**LoadData** uses `httpx`, maps status codes to custom exceptions, and sets `stop_on_exception`. **ProcessData** reads `previous_result`. **GraphData** plots counts per user.

```python
from volnux import EventBase
from volnux.base import RetryPolicy
import logging
import httpx
from .custom_exception import (
    InternalServerErrorException,
    BadRequestException,
    NotFoundException,
)
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor


class LoadData(EventBase):
    """
    Load data event handles fetching data from external sources and feeding it to other events in the pipeline.
    """

    retry_policy = RetryPolicy(
        max_attempts=10,
        backoff_factor=0.005,
        max_backoff=100,
        retry_on_exceptions=[
            InternalServerErrorException,
            BadRequestException,
            NotFoundException,
        ],
    )
    executor = ThreadPoolExecutor

    def process(self, url):
        """
        Fetches data from an external API and returns it as a dictionary.

        Args:
            url (str): The URL of the external API to fetch data from.

        Returns:
            tuple: A tuple containing a boolean indicating success and the fetched data as a dictionary.

        Raises:
            BadRequestException: If the API returns a 400 status code.
            InternalServerErrorException: If the API returns a 500 status code.
        """
        self.stop_on_exception = True
        logging.info("Fetching data from the api")
        response = httpx.get(url)
        if response.status_code == 400:
            raise BadRequestException(response.status_code)
        elif response.status_code == 500:
            raise InternalServerErrorException(response.status_code)
        elif response.status_code == 404:
            raise NotFoundException(response.status_code)
        else:
            response.raise_for_status()
        data = response.json()
        logging.info("Data fetched successfully")

        return True, data


class ProcessData(EventBase):
    """
    Process data event transforms the data fetched from the api and returns it as a dictionary.
    """

    def process(self, *args, **kwargs):
        """
        Transforms the data fetched from the API by counting the number of posts per user.

        This method accesses the result of the previous event and calculates the number of
        posts each user has made. It returns a dictionary where the keys are user IDs and
        the values are the corresponding counts of posts.

        Returns:
            tuple: A boolean indicating success and a dictionary mapping user IDs to post counts.
        """
        previous_value = self.previous_result[0].content

        user_post_counts = defaultdict(int)

        for post in previous_value:
            user_post_counts[post["userId"]] += 1

        # Convert to a regular dict and print results
        user_post_counts = dict(user_post_counts)
        return True, user_post_counts


class GraphData(EventBase):
    """
    Graph data event visualizes the data from the previous event as a bar chart.
    """

    def process(self, *args, **kwargs):
        """
        Visualizes the data from the previous event as a bar chart using matplotlib.

        The event accesses the result of the previous event and uses it to generate a bar chart
        with user IDs on the x-axis and the number of posts per user on the y-axis.

        The chart is displayed when the event is executed, and the event returns a boolean indicating
        success and a message indicating that the data was visualized successfully.

        Returns:
            tuple: A boolean indicating success and a message indicating that the data was visualized successfully.
        """
        import matplotlib.pyplot as plt

        # Your data
        user_post_counts = self.previous_result[0].content

        user_ids = list(user_post_counts.keys())
        post_counts = list(user_post_counts.values())

        # Generate unique colors for each bar
        colors = plt.cm.get_cmap("tab10", len(user_ids))

        # Create the bar chart
        plt.figure(figsize=(10, 6))
        bars = plt.bar(
            user_ids, post_counts, color=[colors(i) for i in range(len(user_ids))]
        )

        # Add labels and title
        plt.xlabel("User ID")
        plt.ylabel("Number of Posts")
        plt.title("Number of Posts per User")
        plt.xticks(user_ids)  # Ensure all user IDs are shown on x-axis

        # Optional: Add value labels on top of bars
        for bar in bars:
            height = bar.get_height()
            plt.text(
                bar.get_x() + bar.get_width() / 2.0,
                height,
                f"{height}",
                ha="center",
                va="bottom",
            )

        # Show plot
        plt.tight_layout()
        plt.show()

        return True, "Data visualized successfully"
```


## 4. HTTP-oriented exceptions (`custom_exception.py`)

```python
class ApiException(Exception):
    """Base class for API exceptions."""

    def __init__(self, status_code, message=None):
        self.status_code = status_code
        self.message = message or f"API returned status code {status_code}"
        super().__init__(self.message)


class BadRequestException(ApiException):
    """Exception for HTTP 400 Bad Request errors."""

    def __init__(self, message=None):
        super().__init__(400, message or "Bad Request")


class InternalServerErrorException(ApiException):
    """Exception for HTTP 500 Internal Server Error errors."""

    def __init__(self, message=None):
        super().__init__(500, message or "Internal Server Error")


class NotFoundException(ApiException):
    """Exception for HTTP 404 Not Found errors."""

    def __init__(self, message=None):
        super().__init__(404, message or "Not Found")
```


## 5. Run (`__main__.py`)

```python
from .etl_pipeline import UserPostETLPipeline

pipeline = UserPostETLPipeline()

pipeline.start()

# To draw ascii graph
# pipeline.draw_ascii_graph()

# To draw graphviz image
# pipeline.draw_graphviz_image()
```


## 6. Run

```bash
cd examples/user_posts_etl
python -m examples.user_posts_etl
```

