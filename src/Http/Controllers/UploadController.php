<?php

namespace Sedehi\Artist\Http\Controllers;

use Sedehi\Artist\Models\UploadTemporary;

class UploadController extends BaseController
{
    public function upload()
    {
        $validation = [];
        if(request()->filled('options')){
            $options = request()->get('options');
            $options = str_replace('()','',$options);
            $options = call_user_func($options);
            $validation = $options->validation;
        }

        request()->validate(['file' => $validation]);
        $file = request()->file('file');
        $path = config('artist.upload_temporary_path');
        $fileName = time().$file->hashName();
        $file->move($path, $fileName);
        $temp = new UploadTemporary();
        $temp->name = $fileName;
        $temp->path = $path;
        $temp->save();

        return  response()->json([
            'uuid' => $temp->id,
            'name' => $temp->name,
            'path' => $temp->path,
            'success' => true,
        ]);
    }

    public function delete()
    {
        $id = request()->getContent();
        $item = UploadTemporary::where('id', $id)->firstOrFail();
        $item->remove();

        return response()->json([
            'success' => true,
            'uuid' => $id,
        ]);
    }
}
