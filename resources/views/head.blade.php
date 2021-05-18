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

    <link href="https://unpkg.com/filepond/dist/filepond.css" rel="stylesheet" />

    <!--
          HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries
        -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
    <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
    <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
    <![endif]-->
    @stack('css')
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
