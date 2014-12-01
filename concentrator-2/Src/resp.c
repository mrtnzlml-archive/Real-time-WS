#include <stdlib.h>
#include <string.h>

char *CRLF = "\x0d\x0a";

char *respString(char *string) {
	char *result = malloc(strlen("+") + strlen(string) + strlen(CRLF) + 1);
	strcpy(result, "+");
	strcat(result, string);
	strcat(result, CRLF);
	return result;
}

char *respError(char *string) {
	char *result = malloc(strlen("-") + strlen(string) + strlen(CRLF) + 1);
	strcpy(result, "+");
	strcat(result, string);
	strcat(result, CRLF);
	return result;
}

char *respInt(int *integer) {
	//TODO:
	char *result = malloc(strlen("+") + strlen((char*)integer) + strlen(CRLF) + 1);
	strcpy(result, "+");
	strcat(result,(char*)integer);
	strcat(result, CRLF);
	return result;
}
