
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:user_id>", views.profile, name="profile"),
    path("following", views.following, name="following"),
    path("close/<int:post_id>", views.close_post, name="close_post"),
    #API routes
    path("<int:post_id>", views.post, name="post"),

    path("inbox", views.loadbox, name="inbox"),
    path("emails", views.compose, name="compose"),
    path("emails/<int:email_id>", views.email, name="email"),
    path("emails/<str:mailbox>", views.mailbox, name="mailbox"),

]
