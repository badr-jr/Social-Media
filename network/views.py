from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect,JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from .models import User,Post,Like,Follower
import json
def index(request,pageNum,user,num):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
@csrf_exempt
def all_posts(request):
    data = json.loads(request.body)
    action = data.get("action")
    if action == "posted":
        data = json.loads(request.body)
        postContent = data.get("postContent")
        user = request.user
        Post.objects.create(owner=user,content=postContent)
        return JsonResponse({"message":"Post added successfully"})
    else:
        endIndex = data.get("currentPage")*10
        if action == "getPage":
            currentPosts = Post.objects.all()
        elif action == "getProfile":
            profileUser =User.objects.filter(username=data.get("profileUsername")).first()
            currentPosts = Post.objects.filter(owner=profileUser)
        elif action == "following":
            currentPosts = Post.objects.none()
            followingPersons = Follower.objects.filter(follower=request.user)
            for person in followingPersons:
                currentPosts = currentPosts | Post.objects.filter(owner=person.user)
        totalPostsNum  = currentPosts.count()
        posts = currentPosts.order_by("-timestamp")[endIndex-10:endIndex]
        return JsonResponse({"currentPosts":[post.serialize(str(request.user.username)) for post in posts],"postsCount":totalPostsNum,"test":currentPosts[0].id})

    
        

@csrf_exempt
def like(request,id):
    post = Post.objects.filter(id=id).first()
    data = json.loads(request.body)
    action = data.get("state")
    if action == "Unlike":
        Like.objects.filter(post=post,liker=request.user).delete()
        return JsonResponse({"message":"Unliked"})
    else:
        Like.objects.create(post=post,liker=request.user)
        return JsonResponse({"message":"liked"})
@csrf_exempt
def follow(request,visited_user):
    user_object = User.objects.filter(username=visited_user).first()
    if request.method == 'GET':
        followers = Follower.objects.filter(user=user_object).count()
        following = Follower.objects.filter(follower=user_object).count()
        state = "Follow"
        if str(request.user) != "AnonymousUser" and Follower.objects.filter(user=user_object,follower=request.user).first():
            state="Unfollow"
        return JsonResponse({"followers":followers,"following":following,"follow_state":state})
    else:
        data = json.loads(request.body)
        state = data.get("state")
        if state == 'Unfollow':
            Follower.objects.filter(user=user_object,follower=request.user).delete()
            return JsonResponse({"message":"Unfollow"})
        else:
            Follower.objects.create(user=user_object,follower=request.user)
            return JsonResponse({"message":"Follow"})
@csrf_exempt
def edit(request,postId):
    if request.method == 'PUT':
        data = json.loads(request.body)
        content = data.get("content")
        Post.objects.filter(id=postId).all().update(content=content)
        return JsonResponse({"message":"edited"})