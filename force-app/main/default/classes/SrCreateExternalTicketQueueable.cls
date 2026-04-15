public with sharing class SrCreateExternalTicketQueueable implements Queueable, Database.AllowsCallouts {

    private Id requestId;

    public SrCreateExternalTicketQueueable(Id requestId) {
        this.requestId = requestId;
    }

    public void execute(QueueableContext context) {

        Service_Request__c req = [
            SELECT Id, Subject__c, Description__c, Priority__c
            FROM Service_Request__c
            WHERE Id = :requestId
            LIMIT 1
        ];

        String ticketId = SrTicketingApiClient.createTicket(req);

        if (ticketId != null) {
            req.External_Ticket_Id__c = ticketId;
            update req;
        }
    }
}