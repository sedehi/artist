<?php

namespace Sedehi\Artist\Traits;


trait Resource
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
