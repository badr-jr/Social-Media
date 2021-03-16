from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Post(models.Model):
    owner = models.ForeignKey(User,on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    def serialize(self,currentUser):
        state = "Like"
        for post in self.posts_likes.all():
            if post.liker.username == currentUser:
                state="Unlike"
                break
        return{
            "id":self.id,
            "owner":self.owner.username,
            "content":self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes":self.posts_likes.count(),
            "like_state":state
        }
    def __str__(self):
        return self.content

class Follower(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="user")
    follower = models.ForeignKey(User,on_delete=models.CASCADE,related_name="follower")

class Like(models.Model):
    post = models.ForeignKey(Post,on_delete=models.CASCADE,related_name="posts_likes")
    liker = models.ForeignKey(User,on_delete=models.CASCADE,related_name="post_likers")
    def serialize(self):
        return{
            "liker":self.liker.username,
        }
