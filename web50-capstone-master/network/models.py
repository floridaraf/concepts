from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ModelForm, Textarea
from django.utils.translation import gettext_lazy as _
from PIL import Image


class User(AbstractUser):
    pass

class Following(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE, related_name="follower")
    following = models.ManyToManyField(User, blank=True, related_name="following")
    followers = models.ManyToManyField(User, blank=True, related_name="followers")

class Like(models.Model):
    users = models.ManyToManyField(User, related_name="like_users")
    num = models.PositiveIntegerField(default=0)

class Comment(models.Model):
    user = models.ForeignKey(User, blank=True, on_delete = models.CASCADE, related_name="comment_user")
    comment = models.TextField()

class CommentForm(ModelForm):
    class Meta:
        model = Comment
        fields = ('comment',)
        exclude = ('user',)
        labels = {
            "comment": _("Comment"),
        }
        widgets = {
            "message": Textarea(
                attrs={"rows": 5, "cols": 200}
            )
        }
        error_messages = {
            'text': {
                'max_length': _("This comment is too long."),
            },
        }

class Post(models.Model):
    user = models.ForeignKey(User, on_delete = models.CASCADE, related_name="post_user")
    text = models.TextField()
    time = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=100, default='')
    likes = models.ForeignKey(Like, null=True, blank=True, on_delete = models.CASCADE, related_name="post_likes")
    price = models.PositiveIntegerField(blank=True)
    comments = models.ManyToManyField(Comment, blank=True, related_name="post_comments")
    closed = models.BooleanField(default=False)
    pictures = models.ImageField(blank=True, null=True)
    pictures2 = models.ImageField(blank=True, null=True)
    pictures3 = models.ImageField(blank=True, null=True)
    pictures4 = models.ImageField(blank=True, null=True)
    


    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "text": self.text,
            "time": self.time.strftime("%B %d, %Y, %I:%M %p"),
            "title": self.title,
            "pictures": self.pictures,
            "pictures2": self.pictures2,
            "pictures3": self.pictures3,
            "pictures4": self.pictures4,
            "likes": self.likes.num,
            "price": self.price.num,
            "comments": [c.comment for c in self.comments.all()],
            "closed": self.closed,
        }

class PostImage(models.Model):
    post = models.ForeignKey(Post, default=None, on_delete=models.CASCADE)
    pictures = models.ImageField(upload_to='upload/')

    def __str__(self):
        return self.post.title

class Email(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="emails")
    sender = models.ForeignKey("User", on_delete=models.PROTECT, related_name="emails_sent")
    recipients = models.ManyToManyField("User", related_name="emails_received")
    subject = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, auto_now=False)
    read = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.sender.username,
            "sender": self.sender.username,
            "recipients": [user.username for user in self.recipients.all()],
            "subject": self.subject,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %-d %Y, %-I:%M %p"),
            "read": self.read,
            "archived": self.archived
        }




class PostForm(ModelForm):
    class Meta: 
        model = Post
        fields = ['text', 'title', 'price', 'pictures', 'pictures2', 'pictures3', 'pictures4',]
        exclude = ('user','time','likes','comments',)
        widgets = {
            "message": Textarea(
                attrs={"rows": 5, "cols": 200}
            )
        }
        error_messages = {
            'text': {
                'max_length': _("This post is too long."),
            },
        }