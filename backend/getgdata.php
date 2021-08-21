<?php

require 'vendor/autoload.php';

//if (php_sapi_name() != 'cli') {
//    throw new Exception('This application must be run on the command line.');
//}

function getClient()
{
    $client = new Google_Client();
    $client->setApplicationName('Get price from gtable');
    $client->setScopes(Google_Service_Sheets::SPREADSHEETS_READONLY);
    $client->setAuthConfig('credentials.json');
    $client->setAccessType('offline');
    $client->setPrompt('select_account consent');

    // Load previously authorized token from a file, if it exists.
    // The file token.json stores the user's access and refresh tokens, and is
    // created automatically when the authorization flow completes for the first
    // time.
    $tokenPath = 'token.json';
    if (file_exists($tokenPath)) {
        $accessToken = json_decode(file_get_contents($tokenPath), true);
        $client->setAccessToken($accessToken);
    }

    // If there is no previous token or it's expired.
    if ($client->isAccessTokenExpired()) {
        // Refresh the token if possible, else fetch a new one.
        if ($client->getRefreshToken()) {
            $client->fetchAccessTokenWithRefreshToken($client->getRefreshToken());
        } else {
            // Request authorization from the user.
            $authUrl = $client->createAuthUrl();
            printf("Open the following link in your browser:\n%s\n", $authUrl);
            print 'Enter verification code: ';
            $authCode = trim(fgets(STDIN));

            // Exchange authorization code for an access token.
            $accessToken = $client->fetchAccessTokenWithAuthCode($authCode);
            $client->setAccessToken($accessToken);

            // Check to see if there was an error.
            if (array_key_exists('error', $accessToken)) {
                throw new Exception(join(', ', $accessToken));
            }
        }
        // Save the token to a file.
        if (!file_exists(dirname($tokenPath))) {
            mkdir(dirname($tokenPath), 0700, true);
        }
        file_put_contents($tokenPath, json_encode($client->getAccessToken()));
    }
    return $client;
}

function getgdata($table_hash, $list, $col='P', $type){
// Get the API client and construct the service object.
    $client = getClient();
    $service = new Google_Service_Sheets($client);

// Prints the names and majors of students in a sample spreadsheet:
// https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
//    $spreadsheetId = '1zk9xiHnJlPkcs1JBdnRMO-b8n4skUbBPHpq2E_5Kd-g';
    $spreadsheetId = $table_hash;
//    $range = 'Cat0!A1:P';
    // $range = $list.'!A1:'.$col;
    $range = $list.'!A1:Z';
    $response = $service->spreadsheets_values->get($spreadsheetId, $range);
    $values = $response->getValues();

    if (empty($values)) {
        print "No data found.\n";
    } else if ($type == '2') {
        $res = [];

        foreach($values as $key => $val) {
            $res[$key]['name'] = $val[0];
            $res[$key]['price'] = $val[1];
            if (!empty($val[2])) {
                $res[$key]['width']['min'] = $val[2];
            }
            if (!empty($val[3])) {
                $res[$key]['width']['max'] = $val[3];
            }
            if (!empty($val[4])) {
                $res[$key]['height']['min'] = $val[4];
            }
            if (!empty($val[5])) {
                $res[$key]['height']['max'] = $val[5];
            }
        }

        // echo '<pre>';print_r($res);die;
        return json_encode($res);
    } else {

        $res = [];
        $x = [];
        $y = [];
        foreach ($values as $key=>$row) {
            if($key==0){
                foreach ($row as $val){
                    if(!empty($val)){
                        $x[] = (string)$val;
                    }
                }
            }else{
                
                foreach ($row as $i=>$val){
                    if($i>0){
                        $res[(string)$x[$i-1]][(string)$row[0]] = $val;
                    }
                }
            }
        }

        return json_encode($res);

    }
}
if(!isset($_GET['table_hash']) || empty($_GET['table_hash']) || !isset($_GET['list']) || empty($_GET['list']) || !isset($_GET['col']) || empty($_GET['col']) || !isset($_GET['type']) || empty($_GET['type'])){
    echo json_encode(['error'=>'invalid data']);exit;
}else{
    echo getgdata($_GET['table_hash'], $_GET['list'], $_GET['col'], $_GET['type']); exit;
}
//http://lightproof-app.30seo.ru/getgdata.php?table_hash=1zk9xiHnJlPkcs1JBdnRMO-b8n4skUbBPHpq2E_5Kd-g&list=Cat0
