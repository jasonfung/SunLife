public with sharing class sunlifeAccountController {
    
    @AuraEnabled(cacheable=true)
    public static List<Account> findAccounts(String searchKey) {
        String key = '%' + searchKey + '%';
        return [
            SELECT Id, Name, Owner.Name, Phone, Website, AnnualRevenue
            FROM Account
            WHERE Name LIKE :key AND Industry = 'Financial Services'
            WITH SECURITY_ENFORCED
        ];
    }
}
