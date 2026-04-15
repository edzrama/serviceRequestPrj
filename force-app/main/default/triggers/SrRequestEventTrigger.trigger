trigger SrRequestEventTrigger on Request_Update__e (after insert) {

    for (Request_Update__e event : Trigger.New) {

        system.debug('Event fired for request ' + event.Request_Id__c);
        system.debug('Event fired for status ' + event.Status__c);
        if (event.Status__c == 'Approved') {
            system.debug('Firing job to create external ticket');
            System.enqueueJob(new SrCreateExternalTicketQueueable(event.Request_Id__c));
        }
    }
}