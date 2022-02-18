<!doctype html>
@php($direction = config('artist.dir'))
<html lang="{{app()->getLocale()}}"  dir="{{$direction}}">
@include('artist::head')








{{--<body class="header-static sidebar-fixed sidebar-dark header-light" id="body">--}}
{{--<div class="wrapper">--}}
{{--    <div class="page-wrapper">--}}
{{--        @include('artist::header')--}}
{{--        <div class="content-wrapper">--}}
{{--            <div class="content">--}}
{{--                @yield('content')--}}
{{--            </div>--}}
{{--        </div>--}}
{{--    </div>--}}
{{--</div>--}}


<body >
<div class="page">
    @include('artist::sidebar')
    <header class="navbar navbar-expand-md navbar-light d-none d-lg-flex d-print-none">
        <div class="container-xl">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="navbar-nav flex-row order-md-last">
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown" aria-label="Open user menu">
                        <span class="avatar avatar-sm" style="background-image: url(./static/avatars/000m.jpg)"></span>
                        <div class="d-none d-xl-block ps-2">
                            <div>Paweł Kuna</div>
                            <div class="mt-1 small text-muted">UI Designer</div>
                        </div>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end dropdown-menu-arrow">
                        <a href="#" class="dropdown-item">Set status</a>
                        <a href="#" class="dropdown-item">Profile & account</a>
                        <a href="#" class="dropdown-item">Feedback</a>
                        <div class="dropdown-divider"></div>
                        <a href="#" class="dropdown-item">Settings</a>
                        <a href="#" class="dropdown-item">Logout</a>
                    </div>
                </div>
            </div>
            <div class="collapse navbar-collapse" id="navbar-menu">
                <div>
                </div>
            </div>
        </div>
    </header>
    <div class="page-wrapper">
        <div class="container-fluid">
        </div>
        <div class="page-body">
            <div class="container-fluid">
                <div class="row row-deck row-cards">

                </div>
            </div>
        </div>
    </div>
</div>
</body>






<script src="{{asset('admin/js/app.js')}}"></script>
@include('artist::notifications')
@stack('action_modals')
@stack('js')
@if(old('modal_id'))
<script type="text/javascript">
    $('#{{old('modal_id')}}').modal('show')
</script>
@endif
</body>
</html>
