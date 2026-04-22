trigger SrRequestEventTrigger on Request_Update__e (after insert) {
    for (Request_Update__e event : Trigger.New) {

        system.debug('Event fired for request ' + event.ParentId__c);
        system.debug('Event fired for status ' + event.Status__c);
        if (event.Status__c == 'Approved') {
            system.debug('Firing job to create external ticket');
            System.enqueueJob(new SrCreateExternalTicketQueueable(event.ParentId__c));
        }
    }

}