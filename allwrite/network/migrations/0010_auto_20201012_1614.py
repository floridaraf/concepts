# Generated by Django 2.2.12 on 2020-10-12 16:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0009_post_pictures'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='pictures',
            field=models.ImageField(blank=True, upload_to='profile_image'),
        ),
    ]
