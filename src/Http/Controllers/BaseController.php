<?php

namespace Sedehi\Artist\Http\Controllers;

use Illuminate\Routing\Controller;

class BaseController extends Controller
{
    public function getResource($resource = null,$section = null)
    {
        if($resource == null && $section == null){
            $section = request()->route()->parameter('section');
            $resource = request()->route()->parameter('resource');
        }

        if($section == null){
           return app()->getNamespace().config('artist.resource_path').'\\'.$resource;
        }

        return app()->getNamespace().config('artist.resource_path').'\\'.$section.'\\'.$resource;
    }
}
