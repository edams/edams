#curl -XDELETE http://localhost:9200/edams-users
curl -XPUT http://localhost:9200/edams-users -d '
{
  "mappings" : {
    "user" : {
      "_id" : { "path" : "id" },
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
        "register_date" : { "type" : "date" },
        "grp_id" : { "type" : "string", "index" : "not_analyzed" },
        "grp_name" : { "type" : "string", "index" : "not_analyzed" },
        "user_type" : { "type" : "string", "index" : "not_analyzed" },
        "id" : { "type" : "string", "index" : "no" },
        "passwd" : { "type" : "string", "index" : "no" },
        "name" : { "type" : "string", "index" : "no" },
        "nicname" : { "type" : "string", "index" : "not_analyzed" },
        "birthday" : { "type" : "date" },
        "email" : { "type" : "string", "index" : "not_analyzed" },
        "phone" : { "type" : "string", "index" : "not_analyzed" }
      }
    }
  }
}'
