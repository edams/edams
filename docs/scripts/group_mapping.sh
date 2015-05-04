#curl -XDELETE http://localhost:9200/edams-groups
curl -XPUT http://localhost:9200/edams-groups -d '
{
  "mappings" : {
    "group" : {
      "_id" : { "path" : "id" },
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
        "id" : { "type" : "string", "index" : "not_analyzed" },
        "name" : { "type" : "string", "index" : "not_analyzed" },
        "comment" : { "type" : "string" },
        "nicnames" : { "type" : "string", "index" : "not_analyzed" },
        "admins" : { "type" : "string", "index" : "not_analyzed" },
        "owner_id" : { "type" : "string", "index" : "no" }
      }
    }
  }
}'
