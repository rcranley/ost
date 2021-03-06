from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render_to_response
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, check_password
from django.contrib.auth.forms import PasswordResetForm
from account.models import UserProfile, Feedback
from django.db import IntegrityError
from django.conf import settings
from django.core.validators import email_re
from django.core.exceptions import ValidationError, MultipleObjectsReturned

import simplejson
import datetime

@csrf_exempt
def authenticateUser(request):
    """
    Inputs:
        username
        password

    """
    if request.method == 'POST':
        try_again = False
        try:
            param = simplejson.loads(request.POST.keys()[0])
        except:
            try_again=True
            pass
        if try_again:
            try:
                param = simplejson.loads(request.raw_post_data)
            except:
                pass

        # user = User.objects.get(username=param.get('username', None))
        
        user = authenticate(username=param.get(
            'username', None), password=param.get('password'))
        try:
            login(request, user)
        except:
            return HttpResponse("auth-error", status=500)

        if user:
            profile = user.profile
            user_dict = {
                'username': user.username,
                'name': ' '.join([user.first_name, user.last_name]),
                'email': user.email,
                'is_staff': user.is_staff,
                'registration': user.profile.registration
            }
            return HttpResponse(simplejson.dumps({
                'success': True, 'user': user_dict
            }))
        else:
            return HttpResponse(simplejson.dumps({'success': False}))
    else:
        return HttpResponse("error", status=500)

@csrf_exempt
def logoutUser(request):
    logout(request)
    return redirect('/respond')

@csrf_exempt
def createUser(request):
    if request.POST:
        param = simplejson.loads(request.POST.keys()[0])
        email = param.get('emailaddress1', None)
        username = param.get('username', None)

        # Valid email address format?
        if email is not None:
            email = email.replace(' ', '+')
            if email_re.match(email) is None:
                if email.find('+') == -1:
                    return HttpResponse("invalid-email", status=500)
        else:
            return HttpResponse("invalid-email", status=500)

        # Username already used?
        if User.objects.filter(username=username).count() > 0:
            return HttpResponse("duplicate-user", status=500)

        # Email address already used?
        if User.objects.filter(email=email).count() > 0:
            return HttpResponse("duplicate-email", status=500)

        user, created = User.objects.get_or_create(username=username, email=email)

        if not created:
            return HttpResponse("duplicate-user", status=500)

        # Okay, all's well. Create the user.
        user.set_password(param.get('password'))
        user.save()
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.registration = '{}'
        profile.save()
        user.save()
        user = authenticate(username=user.username, password=param.get('password'))
        login(request, user)
        user_dict = {
            'username': user.username,
            'name': ' '.join([user.first_name, user.last_name]),
            'email': user.email,
            'is_staff': user.is_staff,
            'registration': profile.registration
        }
        return HttpResponse(simplejson.dumps({'success': True, 'user': user_dict}))

    else:
        return HttpResponse("error", status=500)

@csrf_exempt
def forgotPassword(request):
    if request.POST:
        param = simplejson.loads(request.POST.keys()[0])
        email = param.get('email', None)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return HttpResponse("user-not-found", status=401)  
        except MultipleObjectsReturned:
            return HttpResponse("multiple-users-found", status=500)  
        form = PasswordResetForm({'email': email})
        setattr(form, 'users_cache', [user])
        form.save(from_email=settings.PASSWORD_RESET_EMAIL_FROM, email_template_name='registration/password_reset_email.html')
        return HttpResponse(simplejson.dumps({'success': True}))
    else:
        return HttpResponse("error", status=500)


@csrf_exempt
def sendFeedback(request):
    if request.POST:
        param = simplejson.loads(request.POST.keys()[0])
        feedback_message = param.get('feedback', None)
        data = param.get('data', None)
        feedback = Feedback(message=feedback_message, ts=datetime.datetime.now(), data=data)
        if request.user.is_authenticated():
            feedback.user = request.user
        else:
            feedback.message = "%s\n%s" %(feedback.message, param.get('username', None))
        feedback.save()
    return HttpResponse(simplejson.dumps({'success': True }))

@csrf_exempt
def updateUser(request):
    if request.method == "POST":
        param = simplejson.loads(request.body)
        user = get_object_or_404( User, username=param.get('username', None) )

        if request.user.username != user.username:
            return HttpResponse("You cannot access another user's profile.", status=401)
        else:
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.registration = simplejson.dumps(param.get('registration'))
            profile.save()
            #user.email = param.get('email', None)
            user.save()
            user_dict = {
                'username': user.username,
                'name': ' '.join([user.first_name, user.last_name]),
                'is_staff': user.is_staff,
                'registration': user.profile.registration
            }
            return HttpResponse(simplejson.dumps({'success': True, 'user': user_dict}))
    else:
        return HttpResponse("error", status=500)

@csrf_exempt
@login_required
def getUserProfile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    profile.save()
    request.user.save()
    user_dict = {
        'username': request.user.username,
        'name': ' '.join([request.user.first_name, request.user.last_name]),
        'is_staff': request.user.is_staff,
        'registration': request.user.profile.registration
    }
    return HttpResponse(simplejson.dumps({'success': True, 'user': user_dict}))

@csrf_exempt
def updatePassword(request):
    if request.method == "POST":
        param = simplejson.loads(request.body)
        user = get_object_or_404( User, username=param.get('username', None) )
        if request.user.username != user.username:
            return HttpResponse("You are not logged in as that user.", status=401)
        else:
            passwords = param.get('passwords', None)
            if passwords:
                password_old = passwords.get('old')
                password_new1 = passwords.get('new1')
                password_new2 = passwords.get('new2')
                if password_new1 == password_new2:
                    auth_user = authenticate(username=user.username, password=password_old)
                    if auth_user is not None:
                        user.set_password(password_new1)
                        user.save()
                        return HttpResponse(simplejson.dumps({'success': True}))
                    return HttpResponse("Old password is incorrect.", status=401)
                return HttpResponse("Passwords do not match.", status=401)
    return HttpResponse("error", status=500)
