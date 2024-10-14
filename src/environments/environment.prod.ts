export const environment = {
	production: true ,
	name: window['env' as any]['name' as any] ,
	baseUrl: window['env' as any]['baseUrl'] ,
	sqliteDBName: window['env' as any]['sqliteDBName' as any] ,
	deepLinkUrl: window['env' as any]['deepLinkUrl'],
	privacyPolicyUrl: window['env' as any]['privacyPolicyUrl' as any] ,
	termsOfServiceUrl: window['env' as any]['termsOfServiceUrl' as any] ,
	recaptchaSiteKey: window['env' as any]['recaptchaSiteKey' as any] ,
	recaptchaSiteKeyOld: window['env' as any]['recaptchaSiteKeyOld'] ,
	restictedPages: window['env' as any]['restictedPages'],
	unauthorizedRedirectUrl: window['env' as any]['unauthorizedRedirectUrl' as any] ,
	supportEmail: window['env' as any]['supportEmail' as any] ,
	isAuthBypassed: window['env' as any]['isAuthBypassed'] ,
	password: window['env' as any]['password'] 
}


