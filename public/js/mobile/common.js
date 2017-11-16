//////////////////////////////////////////////////////
// TODO: sostituire quando sara' attivato il login,
//////////////////////////////////////////////////////
if(!sessionStorage.auth) {
	sessionStorage.auth = JSON.stringify({
		token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU5ZTcxNTdhNDA3NWRkMDAxN2ZiZTEyOCIsImVtYWlsIjoiY3BvcnQyMDIwQGdtYWlsLmNvbSIsInR5cGUiOiJjb250ZW50QWRtaW4iLCJlbmFibGVkIjp0cnVlLCJleHAiOjE3MjkyNjMzODU5NTR9.ixFX2mdta2hJmFxThA1efcRXh4pDaDhksJ8DghRMXLQ",
		uid: "59e7157a4075dd0017fbe128"
	});
}
//////////////////////////////////////////////////////