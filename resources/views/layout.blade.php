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
<script src="{{asset('admin/plugins/filepond/filepond-plugin-file-poster.min.js')}}"></script>
<script src="{{asset('admin/plugins/filepond/filepond.min.js')}}"></script>
<script src="{{asset('admin/plugins/filepond/filepond.jquery.js')}}"></script>
<script src="{{asset('admin/plugins/toastr/toastr.min.js')}}"></script>
<script src="{{asset('admin/js/sleek.bundle.js')}}"></script>
<script type="text/javascript">
    $(document).on("FilePond:addfilestart", function(){
        $('#submit-form').find('button[type="submit"]').attr('disabled',true);
    });
    $(document).on("FilePond:processfile FilePond:warning FilePond:error", function(){
        $('#submit-form').find('button[type="submit"]').attr('disabled',false);
    });
</script>
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
