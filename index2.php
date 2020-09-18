<?php

include_once 't2-tmp.html';


function sendRequest($metodo='GET',$url = '',$strRowBody='',$arrHeader=array())
{

    $response = '';
    $ch = curl_init();
    switch($metodo)
    {
        case 'POST':

            curl_setopt($ch,CURLOPT_HTTPHEADER,$arrHeader);
            curl_setopt($ch,CURLOPT_URL,$url);
            curl_setopt($ch,CURLOPT_POST, 1);                //0 for a get request
            curl_setopt($ch,CURLOPT_POSTFIELDS,$strRowBody);
            curl_setopt($ch,CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch,CURLOPT_CONNECTTIMEOUT ,3);
            curl_setopt($ch,CURLOPT_TIMEOUT, 20);
            $response = curl_exec($ch);
            curl_close ($ch);
            break;

        case 'GET':

            curl_setopt($ch, CURLOPT_HTTPHEADER,$arrHeader);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); //Set curl to return the data instead of printing it to the browser.
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT,10); # timeout after 10 seconds, you can increase it
            curl_setopt($ch, CURLOPT_URL, $url );
            $response = curl_exec($ch);
            curl_close ($ch);
            break;


    }

    return $response;
}