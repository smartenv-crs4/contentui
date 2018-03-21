//////////////////////////////////////////////////////
// TODO: sostituire quando sara' attivato il login,
//////////////////////////////////////////////////////
if(!sessionStorage.auth) {
	sessionStorage.auth = JSON.stringify({
		token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoidXNlciIsImlzcyI6IjU5ZGRmNmI4Zjg5MjMyMDAxNzdmODdkNCIsImVtYWlsIjoiY29zdGFudGluby5zb3J1QGNyczQuaXQiLCJ0eXBlIjoiYWRtaW4iLCJlbmFibGVkIjp0cnVlLCJleHAiOjE3NDE5NjQwMjUwODR9.C0aagqMIcWMKVCesmlyY8AGn4Iwfmm2D-Uu1Mtq79_M",
		uid: "59ddf6b8f8923200177f87d4"
	});
}
//////////////////////////////////////////////////////