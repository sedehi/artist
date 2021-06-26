<?php

namespace Sedehi\Artist\Http\Controllers;

use Sedehi\Artist\Models\UploadTemporary;

class UploadController extends BaseController
{
    public function upload()
    {
        request()->validate(['file' => 'required|file']);
        $file = request()->file('file');
        $path = config('artist.upload_temporary_path');

        if ($this->isImage($file)) {
            request()->validate(['file' => 'required|image']);
        }

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

    private function isImage($file)
    {
        return in_array($file->getClientOriginalExtension(), ['png', 'svg', 'bmp', 'jpeg', 'jpg']);
    }
}
