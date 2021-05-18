<!DOCTYPE html>
@if(in_array(app()->getLocale(),['fa','ar']))
    @php($direction = 'rtl')
@else
    @php($direction = 'ltr')
@endif
<html lang="{{app()->getLocale()}}"  dir="{{$direction}}">
@include('artist::head')
<body class="header-static sidebar-fixed sidebar-dark header-light" id="body">
<div class="wrapper">
    @include('artist::sidebar')
    <div class="page-wrapper">
        @include('artist::header')
        <div class="content-wrapper">
            <div class="content">
                @yield('content')
            </div>
        </div>
    </div>
</div>
<script src="{{asset('admin/plugins/jquery/jquery.min.js')}}"></script>
<script src="{{asset('admin/plugins/slimscrollbar/jquery.slimscroll.min.js')}}"></script>
<script src="https://unpkg.com/filepond/dist/filepond.js"></script>
<script src="https://unpkg.com/jquery-filepond/filepond.jquery.js"></script>
<script src="{{asset('admin/js/sleek.bundle.js')}}"></script>
<script>
    $(document).ready(function(){
        $('.files').filepond();
    });

</script>
@stack('js')
</body>
</html>
