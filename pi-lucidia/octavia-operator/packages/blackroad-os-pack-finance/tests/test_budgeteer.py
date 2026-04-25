import pytest
from agents.budgeteer import Budgeteer


class DummyReporter:
    def __init__(self):
        self.posts = []

    def post(self, channel, message):
        self.posts.append((channel, message))


def test_builds_weekly_report_from_cost_explorer(mocker):
    client = mocker.Mock()
    client.get_cost_and_usage.return_value = {
        "ResultsByTime": [{"Total": {"UnblendedCost": {"Amount": "123.45"}}}]
    }

    budgeteer = Budgeteer(budget_limit=1000, slack_channel="#finops")
    reporter = DummyReporter()
    report = budgeteer.build_weekly_report(client, days_elapsed=7, days_in_month=30, reporter=reporter)

    assert "123.45" in report
    assert "Projected month-end" in report
    assert reporter.posts[0][0] == "#finops"
    assert reporter.posts[0][1] == report


def test_forecast_validates_positive_days():
    budgeteer = Budgeteer(budget_limit=1000)
    with pytest.raises(ValueError):
        budgeteer.forecast(100, days_elapsed=0, days_in_month=30)
