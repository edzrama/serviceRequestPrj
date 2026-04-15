public with sharing class SrTicketingApiClient {
    public static String createTicket(Service_Request__c req) {

        Http http = new Http();
        HttpRequest request = new HttpRequest();

        request.setEndpoint('callout:Ticketing_API/tickets/request');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');

        System.debug(request.getEndpoint());

        Map<String, Object> payload = new Map<String, Object>{
            'subject' => req.Subject__c,
            'description' => req.Description__c,
            'priority' => req.Priority__c
        };

        request.setBody(JSON.serialize(payload));

        HttpResponse response = http.send(request);

        if (response.getStatusCode() == 201) {
            Map<String, Object> res = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
            System.debug('response Id: ' + res.get('Id'));
            return (String) res.get('Id');
        }

        return null;
    }
}