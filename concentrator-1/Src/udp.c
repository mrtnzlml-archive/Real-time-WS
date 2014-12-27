/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "udp.h"
#include "lwip/pbuf.h"
#include "lwip/udp.h"
#include "lwip/tcp.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/* Private typedef -----------------------------------------------------------*/
/* Private define ------------------------------------------------------------*/
/* Private macro -------------------------------------------------------------*/
/* Private variables ---------------------------------------------------------*/
extern __IO uint16_t uhADCxConvertedValue;

/* Private function prototypes -----------------------------------------------*/
void udp_receive_callback(void *arg, struct udp_pcb *upcb, struct pbuf *p, struct ip_addr *addr, u16_t port);

char *respString(char *string);
char *respInt(int integer);

u8_t   data[100];
__IO uint32_t message_count = 0;
struct udp_pcb *upcb;

/* Private functions ---------------------------------------------------------*/

/**
  * @brief  Connect to UDP server
  * @param  None
  * @retval None
  */
void concentrator_init(void) {
  struct ip_addr DestIPaddr;
  err_t err;
  
  /* Create a new UDP control block  */
  upcb = udp_new();
  
  if (upcb!=NULL) {
    /*assign destination IP address */
    IP4_ADDR( &DestIPaddr, DEST_IP_ADDR0, DEST_IP_ADDR1, DEST_IP_ADDR2, DEST_IP_ADDR3 );
    
    /* configure destination IP address and port */
    err = udp_connect(upcb, &DestIPaddr, DEST_PORT);
    
    if (err == ERR_OK) {
      /* Set a receive callback for the upcb */
      udp_recv(upcb, udp_receive_callback, NULL);  
    }
  }
}

void concentrator_send() {
  struct pbuf *p;
  
	//sprintf((char*)data, "{\"r\":true,\"t\":%d,\"d\":[%d,%d]}", (int)epoch, message_count++, (int)rand());
	//sprintf((char*)data, "+%s:%d\r\n", DEVICE_UID, uhADCxConvertedValue); //TODO: klouzavy prumer
	sprintf((char*)data, "*2\r\n$4\r\nDATA\r\n$4\r\n%04d\r\n", uhADCxConvertedValue);
	//char *s = respString("OK");
	//sprintf((char*)data, "%s", s);
	//free(s);
  
  /* allocate pbuf from pool*/
  p = pbuf_alloc(PBUF_TRANSPORT, strlen((char*)data), PBUF_POOL);
  
  if (p != NULL) {
    /* copy data to pbuf */
    pbuf_take(p, (char*)data, strlen((char*)data));
    
    /* send udp data */
    udp_send(upcb, p);
    
    /* free pbuf */
    pbuf_free(p);
  }
}

/**
  * @brief This function is called when an UDP datagrm has been received on the port UDP_PORT.
  * @param arg user supplied argument (udp_pcb.recv_arg)
  * @param pcb the udp_pcb which received data
  * @param p the packet buffer that was received
  * @param addr the remote IP address from which the packet was received
  * @param port the remote port from which the packet was received
  * @retval None
  */
void udp_receive_callback(void *arg, struct udp_pcb *upcb, struct pbuf *p, struct ip_addr *addr, u16_t port) {
	BSP_LED_Toggle(LED4);
	//int len = p->tot_len;
	char *pc = (char *)p->payload;
	char *delimiter = "+:\r\n";
	char *token = strtok(pc, delimiter);
	while(token != NULL) {
		if (strcmp(token, "PING") == 0) {
			BSP_LED_Toggle(LED4);
		} else {
			//...
		}
		token = strtok(NULL, delimiter);
	}
	pbuf_free(p); //Free receive pbuf
}
