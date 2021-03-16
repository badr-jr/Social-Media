# Generated by Django 3.1.3 on 2021-03-06 03:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0002_post_timestamp'),
    ]

    operations = [
        migrations.AlterField(
            model_name='like',
            name='liker',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='post_likers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='like',
            name='post',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='posts_likes', to='network.post'),
        ),
    ]