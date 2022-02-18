<!doctype html>
@php($direction = config('artist.dir'))
<html lang="{{app()->getLocale()}}"  dir="{{$direction}}">
@include('artist::head')
<body  class="d-flex flex-column">
<div class="page page-center">
    <div class="container-tight py-4">
        <form class="card card-md" method="POST" action="{!! route('artist.login') !!}" autocomplete="off">
            @csrf
            <div class="card-body">
                <h2 class="card-title text-center mb-4">@lang('artist::auth.title')</h2>
                <div class="mb-3">
                    <label class="form-label" for="email">@lang('validation.attributes.email')</label>
                    <input name="email" type="text" id="email" class="form-control @error('email') is-invalid @enderror" placeholder="@lang('validation.attributes.email')">
                    @error('email')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="mb-2">
                    <label class="form-label" for="password">@lang('validation.attributes.password')</label>
                    <input type="password" name="password" id="password" class="form-control @error('password') is-invalid @enderror"  placeholder="@lang('validation.attributes.password')"  autocomplete="off">
                    @error('password')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
                <div class="form-footer">
                    <button type="submit" class="btn btn-primary w-100">@lang('artist::auth.button')</button>
                </div>
            </div>
        </form>
    </div>
</div>
<script src="{{asset('admin/js/app.js')}}"></script>
</body>
</html>
