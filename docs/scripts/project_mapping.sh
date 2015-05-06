#curl -XDELETE http://localhost:9200/edams-projects
curl -XPUT http://localhost:9200/edams-projects -d '
{
  "mappings" : {
    "project" : {
      "_id" : { "path" : "id" },
      "_timestamp" : { "enabled" : true, "store" : true },
      "properties" : {
        "register_date" : { "type" : "date" },
        "id" : { "type" : "string", "index" : "not_analyzed" },
        "name" : { "type" : "string", "index" : "not_analyzed" },
        "comment" : { "type" : "string" },
        "member" : {
          "type" : "object",
          "properties" : {
            "grp_id": { "type" : "string", "index" : "not_analyzed" },
            "grp_name": { "type" : "string", "index" : "not_analyzed" },
            "id": { "type" : "string", "index" : "not_analyzed" },
            "name": { "type" : "string", "index" : "not_analyzed" },
            "auth": { "type" : "string", "index" : "not_analyzed" },
            "auth_list": {
              "type" : "object",
              "properties" : {
                "id" : { "type" : "string", "index" : "no" },
                "name" : { "type" : "string", "index" : "no" },
                "checked" : { "type" : "boolean"}
              }
            }
          }
        },
        "owner_id" : { "type" : "string", "index" : "not_analyzed" },
        "owner_name" : { "type" : "string", "index" : "not_analyzed" }
      }
    }
  }
}'
