# Generated by Django 2.2.12 on 2020-10-09 05:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0005_auto_20201009_0507'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='price',
            field=models.PositiveIntegerField(blank=True),
        ),
    ]
