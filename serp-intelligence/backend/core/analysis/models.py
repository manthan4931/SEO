from django.db import models


from keywords.models import (
    Keyword
)


class AnalysisReport(models.Model):

    keyword = models.ForeignKey(

        Keyword,

        on_delete=models.CASCADE
    )

    report_data = models.JSONField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.keyword.keyword