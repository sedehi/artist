<?php

namespace Sedehi\Artist\Http\Controllers;

class UploadController extends BaseController
{
    public function upload(){
        logger(request()->all());
    }

    public function delete()
    {
        
    }
}
