/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "concentrator.h"
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
/* Private function prototypes -----------------------------------------------*/
void udp_receive_callback(void *arg, struct udp_pcb *upcb, struct pbuf *p, struct ip_addr *addr, u16_t port);

char *respString(char *string);
char *respInt(int integer);

u8_t   data[100];
__IO uint32_t message_count = 0;
struct udp_pcb *upcb;

/* Private functions ---------------------------------------------------------*/

void concentrator_ping(void) {
	struct pbuf *p;
	sprintf((char*)data, "+PING:%s\r\n", DEVICE_UID);
	p = pbuf_alloc(PBUF_TRANSPORT, strlen((char*)data), PBUF_POOL);
	if (p != NULL) {
		pbuf_take(p, (char*)data, strlen((char*)data));
		udp_send(upcb, p);
		pbuf_free(p);
	}
}

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
    err= udp_connect(upcb, &DestIPaddr, DEST_PORT);
    
    if (err == ERR_OK) {
      /* Set a receive callback for the upcb */
      udp_recv(upcb, udp_receive_callback, NULL);  
    }
  }
	concentrator_ping();
}

void concentrator_send(void) {
  struct pbuf *p;
	time_t epoch = 0;//time(NULL);
  
	sprintf((char*)data, "{\"r\":true,\"t\":%d,\"d\":[%d,%d]}", (int)epoch, message_count++, (int)rand());
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
	/*char data[1024];
	long ptr = 0;
	if(p != NULL) {
		char *pc = (char *)p->payload; //pointer to the payload
		int len = p->tot_len;
		for (int i = 0; i < len; i++) {
			data[ptr+i] = pc[i];
		}
	}*/
	BSP_LED_Toggle(LED3);
	pbuf_free(p); //Free receive pbuf
}
