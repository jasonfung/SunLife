public with sharing class sunlifeAccountController {

    @AuraEnabled( cacheable = true )
    public static List< Account > findAccounts( String searchKey ) {
     
        String strKey = '%' + searchKey + '%';
        return [ SELECT Id, Name, Owner.Name, Phone, Website, AnnualRevenue FROM Account WHERE Industry = 'Financial Services' AND Name LIKE: strKey ];
         
    }
}
