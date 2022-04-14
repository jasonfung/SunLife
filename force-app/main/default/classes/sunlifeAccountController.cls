public with sharing class sunlifeAccountController {

    @AuraEnabled( cacheable = true )
    public static List< Account > findAccounts( String searchKey ) {
     
        String strKey = '%' + searchKey + '%';
        return [ SELECT Id, Name, Owner.Name, Phone, Website, AnnualRevenue FROM Account WHERE Industry = 'Financial Services' AND Name LIKE: strKey WITH SECURITY_ENFORCED];
         
    }

    @AuraEnabled
    public static void updateAccounts(List<Account> accountsForUpdate) {
        // Make sure we can update the database before trying to update
        if (!Schema.sObjectType.Contact.isUpdateable()) {
            throw new SecurityException(
                'Insufficient permissions to update contacts'
            );
        }
        update accountsForUpdate;
    }
}
