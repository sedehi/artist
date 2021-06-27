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
<script src="https://unpkg.com/filepond-plugin-file-poster/dist/filepond-plugin-file-poster.js"></script>
<script src="{{asset('admin/plugins/filepond/filepond.min.js')}}"></script>
<script src="{{asset('admin/plugins/filepond/filepond.jquery.js')}}"></script>
<script src="{{asset('admin/plugins/toastr/toastr.min.js')}}"></script>
<script src="{{asset('admin/js/sleek.bundle.js')}}"></script>
@include('artist::notifications')
@stack('js')
<script>


    FilePond.registerPlugin(FilePondPluginImagePreview);
    FilePond.registerPlugin(FilePondPluginFilePoster);
    $(".files").each(function(){



        $(this).filepond({
            allowReplace:true,
            required:true,
            files:$(this).data('files'),
            server: {
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Accept': 'application/json',
                },
                process: {
                    onerror: (response) => {
                        serverResponse = JSON.parse(response);
                        toastr.error(serverResponse.errors.file);
                    },
                    onload: (formData) => {
                        serverResponse = JSON.parse(formData);
                        $("input[name=remove_"+$(this).data('name')+"]").remove();
                        $('#submit-form').append('<input type="hidden" id="upload-'+serverResponse.uuid+'" name="'+$(this).data('name')+'" value="'+ serverResponse.uuid +'">');
                        return  serverResponse.uuid;
                    },
                },
                revert: {
                    onerror: (response) => {
                        serverResponse = JSON.parse(response);
                        toastr.error(serverResponse.errors.file);
                    },
                    onload: (formData) => {
                        serverResponse = JSON.parse(formData);
                        $('#upload-'+serverResponse.uuid).remove();
                    },
                },
                remove: (source, load, error) => {
                    $('#submit-form').append('<input type="hidden" name="remove_'+$(this).data('name')+'" value="'+ source +'">');
                    $("#upload-"+source).remove();
                    error('oh my goodness');
                    load();
                },
            },
            credits:false
        });


    });

    document.addEventListener("DOMContentLoaded", function() {
        var elements = document.getElementsByTagName("INPUT");
        for (var i = 0; i < elements.length; i++) {
            elements[i].oninvalid = function(e) {
                e.target.setCustomValidity("");
                if (!e.target.validity.valid) {
                    e.target.setCustomValidity("اطلاعات فیلد را تکمیل کنید");
                }
            };
            elements[i].oninput = function(e) {
                e.target.setCustomValidity("");
            };
        }
    })
</script>
</body>
</html>
