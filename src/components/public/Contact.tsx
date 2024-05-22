import styles from '@/styles/Contact.module.css';
import ContactForm from './ContactForm';

const Contact = () => {
	return (
		<div
			className={styles.contactSection}
			id='contact'
		>
			<h2>Get in touch!</h2>
			<p>
				Have Questions? We&apos;re Here to Help! Contact us to learn how
				ApparelQuoter can streamline your business operations. Let&apos;s get
				started on your journey to success!
			</p>
			<ContactForm />
		</div>
	);
};

export default Contact;
