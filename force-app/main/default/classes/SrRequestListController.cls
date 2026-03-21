public with sharing class SrRequestListController {

    public class RequestPageWrapper {
        @AuraEnabled public List<Service_Request__c> records;
        @AuraEnabled public Integer totalCount;
    }

    @AuraEnabled(cacheable=true)
    public static RequestPageWrapper getRequests(Integer pageSize, Integer pageNumber) {

        Integer offsetSize = (pageNumber - 1) * pageSize;

        List<Service_Request__c> records = [
            SELECT Id, Subject__c, Status__c, Priority__c,
                   Owner.Name, CreatedDate
            FROM Service_Request__c
            ORDER BY CreatedDate DESC
            LIMIT :pageSize
            OFFSET :offsetSize
        ];

        Integer totalCount = [
            SELECT COUNT()
            FROM Service_Request__c
        ];

        RequestPageWrapper wrapper = new RequestPageWrapper();
        wrapper.records = records;
        wrapper.totalCount = totalCount;

        return wrapper;
    }

    @AuraEnabled(cacheable=true)
    public static List<Service_Request_Comment__c> getComments(Id requestId) {
        return [
            SELECT Id, Comment__c, CreatedDate, CreatedBy.Name
            FROM Service_Request_Comment__c
            WHERE Service_Request__c = :requestId
            ORDER BY CreatedDate DESC
        ];
    }
}