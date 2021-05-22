<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>@yield('title')</title>

    <link href="https://cdn.materialdesignicons.com/4.4.95/css/materialdesignicons.min.css" rel="stylesheet" />

    @if($direction == 'rtl')
        <link rel="stylesheet" href="{{asset('admin/css/sleek.min.rtl.css')}}" />
    @else
        <link rel="stylesheet" href="{{asset('admin/css/sleek.min.css')}}" />
    @endif
    <link href="{{asset('admin/plugins/filepond/filepond.min.css')}}" rel="stylesheet" />
    <link href="{{asset('admin/plugins/filepond/filepond-plugin-image-preview.min.css')}}" rel="stylesheet" />
    @stack('css')
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
