<!doctype html>
<html lang="{{app()->getLocale()}}" dir="{{config('artist.dir')}}">
<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>Admin</title>
    <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
    <meta name="msapplication-TileColor" content="#206bc4"/>
    <meta name="theme-color" content="#206bc4"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="mobile-web-app-capable" content="yes"/>
    <meta name="HandheldFriendly" content="True"/>
    <meta name="MobileOptimized" content="320"/>
    <meta name="robots" content="noindex,nofollow,noarchive"/>
    <link href="{{asset('admin/css/tabler.min.css')}}" rel="stylesheet"/>
    <link href="{{asset('admin/css/all.min.css')}}" rel="stylesheet"/>
</head>
<body class="antialiased">
@include('artist::header')
<div class="page">
    @include('artist::header-responsive')
    <div class="content">
        <div class="container-fluid">
            <div class="row">
             @yield('content')
            </div>
        </div>
    </div>
</div>
<!-- Libs JS -->
<script src="{{asset('admin/libs/bootstrap/dist/js/bootstrap.bundle.min.js')}}"></script>
<!-- Tabler Core -->
<script src="{{asset('admin/js/tabler.min.js')}}"></script>
</body>
</html>
