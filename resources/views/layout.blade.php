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
<script>
    window.jquery = $;
</script>
<script src="{{asset('admin/plugins/slimscrollbar/jquery.slimscroll.min.js')}}"></script>
<script src="{{asset('admin/plugins/filepond/filepond-plugin-image-preview.min.js')}}"></script>
<script src="{{asset('admin/plugins/filepond/filepond.min.js')}}"></script>
<script src="{{asset('admin/plugins/filepond/filepond.jquery.js')}}"></script>
<script src="{{asset('admin/plugins/toastr/toastr.min.js')}}"></script>
<script src="{{asset('admin/js/sleek.bundle.js')}}"></script>
<script>
    toastr.options.closeButton = true;
    toastr.options.preventDuplicates = true;
    toastr.options.timeOut = 5000;
    toastr.options.rtl = (document.dir == 'rtl')? true : false;
    toastr.options.positionClass = (document.dir == 'rtl')? "toast-bottom-left" : "toast-bottom-right";

    @if(session()->has('warning'))
        toastr.warning('{{session('warning')}}')
    @endif

    @if(session()->has('success'))
        toastr.success('{{session('success')}}')
    @endif

    @if(session()->has('info'))
        toastr.info('{{session('info')}}')
    @endif

    @if(session()->has('danger'))
        toastr.error('{{session('danger')}}')
    @endif

    @if(session()->has('error'))
        toastr.error('{{session('error')}}')
    @endif
</script>
@stack('js')
</body>
</html>
