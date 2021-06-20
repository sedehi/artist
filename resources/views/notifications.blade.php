@push('js')
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
@endpush
