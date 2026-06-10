export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:8090',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'theralink',
    clientId: 'theralink-angular',
  },
  stripe: {
    publicKey: 'pk_test_51TMrDmKzrehkdV5pQF37QrZYJjeMggPoaS7ERdQCfVyaxgEIu06rJlTUVi2oomjW5d2R0L30NazniHoS8gh6QpgW00lAjtUaK3',
  },
};
