import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, Http404, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.views.decorators.csrf import csrf_exempt

from .models import *

def index(request):
    # Authenticated users view posts
    if request.user.is_authenticated:
        # GET
        if request.method == 'GET':
            all_posts = Post.objects.all().order_by('-time')
            page = request.GET.get('page', 1)
            paginator = Paginator(all_posts, 10)
            try:
                posts = paginator.page(page)
            except PageNotAnInteger:
                posts = paginator.page(1)
            except EmptyPage:
                posts = paginator.page(paginator.num_pages)
            
            post_form = PostForm(initial={'user': request.user})
            comment_form = CommentForm(initial={'user': request.user})
            return render(request, "network/index.html", {'posts': posts, 'post_form': post_form, 'comment_form': comment_form})
        
        # POST
        if request.method == 'POST':
            # Create form with request data
            form = PostForm(request.POST, request.FILES)

            if form.is_valid():
                # Create new like obj and relate to this post
                l = Like(num = 0)
                l.save()
                p = form.save(commit=False)
                p.user = request.user
                p.text = form.cleaned_data['text']
                p.likes = l
                p.save()

                return HttpResponseRedirect('/')
            raise Http404("Invalid form response")

    # Or sign in
    else:
        return HttpResponseRedirect(reverse("login"))

@login_required(redirect_field_name='index', login_url='/login')
def post(request, post_id):
    try: 
        p = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        raise Http404("Post does not exist")

    # GET for prefilled edit form
    if request.method == 'GET':
        print(JsonResponse(p.serialize()))
        return JsonResponse(p.serialize())
    # PUT
    else:

        
        data = json.loads(request.body)
        

        # Edit
        if data.get("text") is not None:
            p.text = data.get("text")
        
        if data.get("pictures") is not None:
            p.pictures = data.get("pictures")
        # Like
        if data.get("likes") is not None:
            if p.likes.num < data.get("likes"):
                p.likes.users.add(request.user)
            if p.likes.num > data.get("likes"): 
                p.likes.users.remove(request.user)
            l = p.likes
            lk = Like.objects.filter(id=l.id)
            lk.update(num = data.get("likes"))
        # Comment
        if data.get("comment") is not None:
            c = Comment(user=request.user, comment=data.get("comment"))
            c.save()
            p.comments.add(c)
            return HttpResponseRedirect('/')
        p.save()

@login_required(redirect_field_name='index', login_url='/login')
def close_post(request, post_id):

    if request.method == 'PUT':
        try: 
            p = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            raise Http404("Post does not exist")

        
        if p.closed == True:
            p.closed = False
        else: 
            p.closed = True
        p.save()
        return HttpResponseRedirect(reverse("index"))



@login_required(redirect_field_name='following', login_url='/login')
def following(request):
    try: 
        f = Following.objects.get(user=request.user)
    except Following.DoesNotExist:
        nf = Following(user=request.user)
        nf.save()

    # GET
    if request.method == 'GET':
        uf = Following.objects.filter(user=request.user).values_list('following', flat=True)
        all_posts = Post.objects.filter(user__id__in=uf).order_by('-time')
        page = request.GET.get('page', 1)
        paginator = Paginator(all_posts, 10)
        try:
            posts = paginator.page(page)
        except PageNotAnInteger:
            posts = paginator.page(1)
        except EmptyPage:
            posts = paginator.page(paginator.num_pages)

        comment_form = CommentForm(initial={'user': request.user})
        return render(request, 'network/following.html', {'posts': posts, 'comment_form': comment_form})
    
    # POST
    f = Following.objects.get(user=request.user)
    if request.method == 'POST':
        pu = User.objects.get(username=request.POST['pu'])
        try: 
            pf = Following.objects.get(user=pu)
        except Following.DoesNotExist:
            npf = Following(user=pu)
            npf.save()
        pf = Following.objects.get(user=pu)
        
        if 'follow' in request.POST:
            f.following.add(pu)
            pf.followers.add(request.user)
        if 'unfollow' in request.POST:
            f.following.remove(pu)
            pf.followers.remove(request.user)
        
        return HttpResponseRedirect(reverse('following'))

def profile(request, user_id):
    try:
        pu = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise Http404("User does not exist")

    # Get post user's follow data
    try: 
        pf = Following.objects.get(user=pu)
    except Following.DoesNotExist:
        npf = Following(user=pu)
        npf.save()
    pf = Following.objects.get(user=pu)
    
    # Get post user's posts
    all_posts = Post.objects.filter(user=pu).order_by('-time')
    page = request.GET.get('page', 1)
    paginator = Paginator(all_posts, 10)
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)
    
    if request.user.is_authenticated:
        # Get user's follow data
        try: 
            f = Following.objects.get(user=request.user)
        except Following.DoesNotExist:
            nf = Following(user=request.user)
            nf.save()
        
        uf = Following.objects.filter(user=request.user).values_list('following', flat=True)
        us = User.objects.filter(id__in = uf)
        post_form = PostForm(initial={'user': request.user})
        comment_form = CommentForm(initial={'user': request.user})

        return render(request, "network/profile.html", {'pu': pu, 'pf': pf, 'posts': posts, 'us': us, 'post_form': post_form, 'comment_form': comment_form})
    # Return profile for unauthenticated users
    return render(request, "network/profile.html", {'pu': pu, 'pf': pf, 'posts': posts})

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

def loadbox(request):

    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "network/inbox.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))



@csrf_exempt
@login_required
def compose(request):

    # Composing a new email must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Check recipient emails
    data = json.loads(request.body)
    usernames = [username.strip() for username in data.get("recipients").split(",")]
    if usernames == [""]:
        return JsonResponse({
            "error": "At least one recipient required."
        }, status=400)

    # Convert email addresses to users
    recipients = []
    for username in usernames:
        try:
            user = User.objects.get(username=username)
            recipients.append(user)
        except User.DoesNotExist:
            return JsonResponse({
                "error": f"User with email {username} does not exist."
            }, status=400)

    # Get contents of email
    subject = data.get("subject", "")
    body = data.get("body", "")

    # Create one email for each recipient, plus sender
    users = set()
    users.add(request.user)
    users.update(recipients)
    for user in users:
        email = Email(
            user=user,
            sender=request.user,
            subject=subject,
            body=body,
            read=user == request.user
        )
        email.save()
        for recipient in recipients:
            email.recipients.add(recipient)
        email.save()

    return JsonResponse({"message": "Email sent successfully."}, status=201)


@login_required
def mailbox(request, mailbox):

    # Filter emails returned based on mailbox
    if mailbox == "inbox":
        emails = Email.objects.filter(
            user=request.user, recipients=request.user, archived=False
        )
    elif mailbox == "sent":
        emails = Email.objects.filter(
            user=request.user, sender=request.user
        )
    elif mailbox == "archive":
        emails = Email.objects.filter(
            user=request.user, recipients=request.user, archived=True
        )
    else:
        return JsonResponse({"error": "Invalid mailbox."}, status=400)

    # Return emails in reverse chronologial order
    emails = emails.order_by("-timestamp").all()
    return JsonResponse([email.serialize() for email in emails], safe=False)


@csrf_exempt
@login_required
def email(request, email_id):

    # Query for requested email
    try:
        email = Email.objects.get(user=request.user, pk=email_id)
    except Email.DoesNotExist:
        return JsonResponse({"error": "Email not found."}, status=404)

    # Return email contents
    if request.method == "GET":
        return JsonResponse(email.serialize())

    # Update whether email is read or should be archived
    elif request.method == "PUT":
        data = json.loads(request.body)
        if data.get("read") is not None:
            email.read = data["read"]
        if data.get("archived") is not None:
            email.archived = data["archived"]
        email.save()
        return HttpResponse(status=204)

    # Email must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)
