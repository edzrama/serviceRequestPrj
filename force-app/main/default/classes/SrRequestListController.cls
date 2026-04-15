public with sharing class SrRequestListController {

    public class RequestPageWrapper {
        @AuraEnabled public List<Service_Request__c> records;
        @AuraEnabled public Integer totalCount;
    }

    @AuraEnabled(cacheable=true)
    public static RequestPageWrapper getRequests(
        Integer pageSize,
        Integer pageNumber,
        String sortBy,
        String sortDirection,
        String searchKey,
        String statusFilter,
        String priorityFilter
    ) {
        Integer offsetSize = (pageNumber - 1) * pageSize;

        String baseQuery = ' FROM Service_Request__c WHERE Id != null';

        // 🔍 Search
        if (!String.isBlank(searchKey)) {
            baseQuery += ' AND Subject__c LIKE \'%' + String.escapeSingleQuotes(searchKey) + '%\'';
        }

        // 🎯 Filters
        if (!String.isBlank(statusFilter)) {
            baseQuery += ' AND Status__c = :statusFilter';
        }

        if (!String.isBlank(priorityFilter)) {
            baseQuery += ' AND Priority__c = :priorityFilter';
        }

        // 🔢 Sorting
        if (String.isBlank(sortBy)) {
            sortBy = 'CreatedDate';
            sortDirection = 'DESC';
        }

        String query =
            'SELECT Id, Subject__c, Status__c, Priority__c, Owner.Name, CreatedDate ' +
            baseQuery +
            ' ORDER BY ' + sortBy + ' ' + sortDirection +
            ' LIMIT :pageSize OFFSET :offsetSize';

        List<Service_Request__c> records = Database.query(query);

        Integer totalCount = Database.countQuery(
            'SELECT COUNT() ' + baseQuery
        );

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