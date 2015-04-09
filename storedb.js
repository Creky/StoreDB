var storedb = function(collectionName){
    collectionName = collectionName ? collectionName : 'default';
    
    var err;
    var cache = localStorage[collectionName] ? JSON.parse(localStorage[collectionName]) : [];
    var checkIdExist=function(checkId){
        for(var i = 0; i < cache.length; i++){
            if(cache[i]["_id"] == checkId){
                return true;
            }
        }
        return false;
    };
    var regxMatches=function(rx,str){
        var regx=new RegExp(rx,"ig")
        return regx.test(str);
    }

    return {
        createId: function(){
            var id=new Date().valueOf();
            while(checkIdExist(id)){
                id++;
            }
            return id;
        },

        insert: function(obj,callback){
            obj["_id"] = obj["_id"]&&!checkIdExist(obj["_id"])?obj["_id"]:this.createId();
            cache.push(obj);
            localStorage.setItem(collectionName,JSON.stringify(cache));
            if(callback)
                callback(err,obj);
        },

        /**
         *  Query content.
         * @param obj
         * @param callback
         * @returns {*}
         */
        find: function(obj, callback){
            if(arguments.length == 0){
                return cache;
            } else {
                var result = [];

                for(var key in obj){
                    var regx;
                    for(var i = 0; i < cache.length; i++){
                        if(cache[i][key] == obj[key] || cache[i][key]=="*" || obj[key].indexOf(cache[i][key]) != -1 || regxMatches(cache[i][key],obj[key]) ){
                            result.push(cache[i]);
                        }
                    }
                }
                if(callback)
                    callback(err,result);
                else
                    return result;
            }     
        },

        update: function(obj,upsert,callback){

            for(var key in obj){
                for(var i = 0; i < cache.length; i++){
                    if(cache[i][key] == obj[key]){

                        end_loops:
                        for(var upsrt in upsert){
                            switch(upsrt){
                            case "$inc":
                                for(var newkey in upsert[upsrt]){
                                    cache[i][newkey] = parseInt(cache[i][newkey]) + parseInt(upsert[upsrt][newkey]);
                                }
                                break;

                            case "$set":
                                for(var newkey in upsert[upsrt]){
                                    cache[i][newkey] = upsert[upsrt][newkey];
                                }
                                break;

                            case "$push":
                                for(var newkey in upsert[upsrt]){
                                    cache[i][newkey].push(upsert[upsrt][newkey]);
                                }
                                break;

                            default:
                                upsert['_id'] = cache[i]['_id'];
                                cache[i] = upsert;
                                break end_loops;
                            }
                        }
                    }
                }
            }
            localStorage.setItem(collectionName,JSON.stringify(cache));
            if(callback)
                callback(err);

        },

        remove: function(obj,callback){
            if(arguments.length == 0){
                localStorage.removeItem(collectionName);
            } else {

                for(var key in obj){
                    for (var i = cache.length - 1; i >= 0; i--) {
                        if(cache[i][key] == obj[key]){
                            cache.splice(i,1);
                        }
                    }
                }
                localStorage.setItem(collectionName, JSON.stringify(cache));
            }
            
            if(callback)
                callback(err);
            
        }

    };
};