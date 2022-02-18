<head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
    <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
    <title>
        @hasSection('title')
            {{ trans('artist::artist.name') }} | @yield('title')
        @else
            {{ trans('artist::artist.name') }}
        @endif
    </title>
    <link href="{{asset('admin/css/app.css')}}" rel="stylesheet"/>
    @stack('css')
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>