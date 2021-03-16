
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index",kwargs={'pageNum':'','user':'','num':''}),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts/all",views.all_posts,name="all_posts"),
    path("like/<int:id>",views.like,name="like"),
    path("page/<int:pageNum>",views.index,name="get_page",kwargs={'user':'','num':''}),
    path("profile/<str:user>",views.index,name="profile",kwargs={'pageNum':'','num':''}),
    path("profile/<str:user>/page/<int:num>",views.index,name="profile_page",kwargs={'pageNum':''}),
    path("follow/<str:visited_user>",views.follow,name="follow"),
    path("following",views.index,name="following_page",kwargs={'pageNum':'','num':'','user':''}),
    path("following/page/<int:pageNum>",views.index,name="following_page_num",kwargs={'num':'','user':''}),
    path("edit/<int:postId>",views.edit,name="edit")
]
