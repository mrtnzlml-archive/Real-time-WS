/**
  ******************************************************************************
  * @file    LwIP/LwIP_TCP_Echo_Client/Src/tcp_echoclient.c
  * @author  MCD Application Team
  * @version V1.1.0
  * @date    26-June-2014 
  * @brief   tcp echoclient application using LwIP RAW API
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; COPYRIGHT(c) 2014 STMicroelectronics</center></h2>
  *
  * Licensed under MCD-ST Liberty SW License Agreement V2, (the "License");
  * You may not use this file except in compliance with the License.
  * You may obtain a copy of the License at:
  *
  *        http://www.st.com/software_license_agreement_liberty_v2
  *
  * Unless required by applicable law or agreed to in writing, software 
  * distributed under the License is distributed on an "AS IS" BASIS, 
  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  * See the License for the specific language governing permissions and
  * limitations under the License.
  *
  ******************************************************************************
  */

/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "lwip/debug.h"
#include "lwip/stats.h"
#include "lwip/tcp.h"
#include "lwip/memp.h"
#include <stdio.h>
#include <string.h>

#if LWIP_TCP
/* Private typedef -----------------------------------------------------------*/
/* Private define ------------------------------------------------------------*/
/* Private macro -------------------------------------------------------------*/
/* Private variables ---------------------------------------------------------*/

u8_t  recev_buf[50];
__IO uint32_t tcp_message_count=0;

u8_t   tcp_data[100];

struct tcp_pcb *echoclient_pcb;


/* ECHO protocol states */
enum echoclient_states
{
  ES_NOT_CONNECTED = 0,
  ES_CONNECTED,
  ES_RECEIVED,
  ES_CLOSING,
};


/* structure to be passed as argument to the tcp callbacks */
struct echoclient
{
  enum echoclient_states state; /* connection status */
  struct tcp_pcb *pcb;          /* pointer on the current tcp_pcb */
  struct pbuf *p_tx;            /* pointer on pbuf to be transmitted */
};


/* Private function prototypes -----------------------------------------------*/
static err_t tcp_echoclient_recv(void *arg, struct tcp_pcb *tpcb, struct pbuf *p, err_t err);
static void tcp_echoclient_connection_close(struct tcp_pcb *tpcb, struct echoclient * es);
static err_t tcp_echoclient_poll(void *arg, struct tcp_pcb *tpcb);
static err_t tcp_echoclient_sent(void *arg, struct tcp_pcb *tpcb, u16_t len);
static void tcp_echoclient_send(struct tcp_pcb *tpcb, struct echoclient * es);
static err_t tcp_echoclient_connected(void *arg, struct tcp_pcb *tpcb, err_t err);

/* Private functions ---------------------------------------------------------*/

/**
* @brief  Connects to the TCP server
* @param  None
* @retval None
*/
void tcp_echoclient_connect(void) {
	struct ip_addr DestIPaddr;
	struct ip_addr IPaddr;
	echoclient_pcb = tcp_new(); //create new tcp pcb
	if (echoclient_pcb != NULL) {
		IP4_ADDR( &DestIPaddr, DEST_IP_ADDR0, DEST_IP_ADDR1, DEST_IP_ADDR2, DEST_IP_ADDR3 );
		IP4_ADDR( &IPaddr, IP_ADDR0, IP_ADDR1, IP_ADDR2, IP_ADDR3 );
		tcp_bind(echoclient_pcb, &IPaddr, DEST_PORT);
		err_t err = tcp_connect(echoclient_pcb, &DestIPaddr, DEST_PORT, tcp_echoclient_connected); //connect to destination address/port
		//vraci ERR_MEM, nebo ERR_OK
	} else {
		//can not create tcp pcb
		memp_free(MEMP_TCP_PCB, echoclient_pcb); //deallocate the pcb
	}
}

/**
  * @brief Function called when TCP connection established
  * @param tpcb: pointer on the connection contol block
  * @param err: when connection correctly established err should be ERR_OK 
  * @retval err_t: returned error 
  */
static err_t tcp_echoclient_connected(void *arg, struct tcp_pcb *tpcb, err_t err)
{
  struct echoclient *es = NULL;
  
  if (err == ERR_OK)   
  {
    /* allocate structure es to maintain tcp connection informations */
    es = (struct echoclient *)mem_malloc(sizeof(struct echoclient));
  
    if (es != NULL)
    {
      es->state = ES_CONNECTED;
      es->pcb = tpcb;
      
      //sprintf((char*)tcp_data, "sending tcp client message %d", (int)tcp_message_count);
	  sprintf((char*)tcp_data, "*2\r\n$4\r\nPING\r\n$11\r\n%s\r\n", DEVICE_UID);
        
      /* allocate pbuf */
      es->p_tx = pbuf_alloc(PBUF_TRANSPORT, strlen((char*)tcp_data) , PBUF_POOL);
         
      if (es->p_tx)
      {       
        /* copy tcp_data to pbuf */
        pbuf_take(es->p_tx, (char*)tcp_data, strlen((char*)tcp_data));
        
        /* pass newly allocated es structure as argument to tpcb */
        tcp_arg(tpcb, es);
  
        /* initialize LwIP tcp_recv callback function */ 
        tcp_recv(tpcb, tcp_echoclient_recv);
  
        /* initialize LwIP tcp_sent callback function */
        tcp_sent(tpcb, tcp_echoclient_sent);
  
        /* initialize LwIP tcp_poll callback function */
        tcp_poll(tpcb, tcp_echoclient_poll, 1);
    
        /* send tcp_data */
        tcp_echoclient_send(tpcb,es);
        
        return ERR_OK;
      }
    }
    else
    {
      /* close connection */
      tcp_echoclient_connection_close(tpcb, es);
      
      /* return memory allocation error */
      return ERR_MEM;  
    }
  }
  else
  {
    /* close connection */
    tcp_echoclient_connection_close(tpcb, es);
  }
  return err;
}

/**
  * @brief tcp_receiv callback
  * @param arg: argument to be passed to receive callback 
  * @param tpcb: tcp connection control block 
  * @param err: receive error code 
  * @retval err_t: retuned error  
  */
static err_t tcp_echoclient_recv(void *arg, struct tcp_pcb *tpcb, struct pbuf *p, err_t err)
{ 
  struct echoclient *es;
  err_t ret_err;
  

  LWIP_ASSERT("arg != NULL",arg != NULL);
  
  es = (struct echoclient *)arg;
  
  /* if we receive an empty tcp frame from server => close connection */
  if (p == NULL)
  {
    /* remote host closed connection */
    es->state = ES_CLOSING;
    if(es->p_tx == NULL)
    {
       /* we're done sending, close connection */
       tcp_echoclient_connection_close(tpcb, es);
    }
    else
    {    
      /* send remaining tcp_data*/
      tcp_echoclient_send(tpcb, es);
    }
    ret_err = ERR_OK;
  }   
  /* else : a non empty frame was received from echo server but for some reason err != ERR_OK */
  else if(err != ERR_OK)
  {
    /* free received pbuf*/
    if (p != NULL)
    {
      pbuf_free(p);
    }
    ret_err = err;
  }
  else if(es->state == ES_CONNECTED)
  {
    /* increment message count */
    tcp_message_count++;
         
    /* Acknowledge tcp_data reception */
    tcp_recved(tpcb, p->tot_len);  
    
    pbuf_free(p);
    tcp_echoclient_connection_close(tpcb, es);
    ret_err = ERR_OK;
  }

  /* tcp_data received when connection already closed */
  else
  {
    /* Acknowledge tcp_data reception */
    tcp_recved(tpcb, p->tot_len);
    
    /* free pbuf and do nothing */
    pbuf_free(p);
    ret_err = ERR_OK;
  }
  return ret_err;
}

/**
  * @brief function used to send tcp_data
  * @param  tpcb: tcp control block
  * @param  es: pointer on structure of type echoclient containing info on tcp_data 
  *             to be sent
  * @retval None 
  */
static void tcp_echoclient_send(struct tcp_pcb *tpcb, struct echoclient * es) {
	struct pbuf *ptr;
	err_t wr_err = ERR_OK;
 
	while ((wr_err == ERR_OK) &&
			(es->p_tx != NULL) && 
			(es->p_tx->len <= tcp_sndbuf(tpcb)))
	{
		ptr = es->p_tx; //get pointer on pbuf from es structure
		wr_err = tcp_write(tpcb, ptr->payload, ptr->len, 1); //enqueue tcp_data for transmission
		if (wr_err == ERR_OK) { 
			es->p_tx = ptr->next; //continue with next pbuf in chain (if any)
			if(es->p_tx != NULL) {
				pbuf_ref(es->p_tx); //increment reference count for es->p
			}
			pbuf_free(ptr); //free pbuf: will free pbufs up to es->p (because es->p has a reference count > 0)
	   } else if(wr_err == ERR_MEM) {
			es->p_tx = ptr; //we are low on memory, try later, defer to poll
	   } else {
			//other problem ??
	   }
	}
}

/**
  * @brief  This function implements the tcp_poll callback function
  * @param  arg: pointer on argument passed to callback
  * @param  tpcb: tcp connection control block
  * @retval err_t: error code
  */
static err_t tcp_echoclient_poll(void *arg, struct tcp_pcb *tpcb) {
	
	err_t ret_err;
	struct echoclient *es;

	es = (struct echoclient*)arg;
	if (es != NULL) {
		if (es->p_tx != NULL) {
			tcp_echoclient_send(tpcb, es); //there is a remaining pbuf (chain), try to send tcp_data
		} else { //no remaining pbuf (chain)
			if(es->state == ES_CLOSING) {
				tcp_echoclient_connection_close(tpcb, es); //close tcp connection
			}
		}
		ret_err = ERR_OK;
	} else { //nothing to be done
		tcp_abort(tpcb);
		ret_err = ERR_ABRT;
	}
	return ret_err;
}

/**
  * @brief  This function implements the tcp_sent LwIP callback (called when ACK
  *         is received from remote host for sent tcp_data) 
  * @param  arg: pointer on argument passed to callback
  * @param  tcp_pcb: tcp connection control block
  * @param  len: length of tcp_data sent 
  * @retval err_t: returned error code
  */
static err_t tcp_echoclient_sent(void *arg, struct tcp_pcb *tpcb, u16_t len)
{
  struct echoclient *es;

  LWIP_UNUSED_ARG(len);

  es = (struct echoclient *)arg;
  
  if(es->p_tx != NULL)
  {
    /* still got pbufs to send */
    tcp_echoclient_send(tpcb, es);
  }

  return ERR_OK;
}

/**
  * @brief This function is used to close the tcp connection with server
  * @param tpcb: tcp connection control block
  * @param es: pointer on echoclient structure
  * @retval None
  */
static void tcp_echoclient_connection_close(struct tcp_pcb *tpcb, struct echoclient * es ) {
	
	/* remove callbacks */
	tcp_recv(tpcb, NULL);
	tcp_sent(tpcb, NULL);
	tcp_poll(tpcb, NULL, 0);

	if (es != NULL) {
		mem_free(es);
	}

	tcp_close(tpcb); //close tcp connection
}

#endif /* LWIP_TCP */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
