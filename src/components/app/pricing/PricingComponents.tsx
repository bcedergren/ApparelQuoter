import { FC } from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import ArtCostComponent from '@/components/app/pricing/ArtCost';
import WholesaleMarkupComponent from '@/components/app/pricing/WholesaleMarkup';
import PrintingQuantityRanges from '@/components/app/pricing/PrintingQuantityRanges';
import PrintingLocationNames from '@/components/app/pricing/PrintingLocationNames';
import DTGPrintingComponent from '@/components/app/pricing/DTGPrinting';
import DyeSublimation from '@/components/app/pricing/DyeSublimation';
import PreCutVinyl from '@/components/app/pricing/PreCutVinyl';
import Embroidery from '@/components/app/pricing/Embroidery';
import ScreenPrinting from '@/components/app/pricing/ScreenPrinting';
import { Price } from '@/types/Price';
import styles from '@/styles/PricingComponents.module.css';

interface PricingComponentsProps {
	priceData: Price;
	setPriceData: (priceData: Price) => void;
	handleSave: () => void;
}

const PricingComponents: FC<PricingComponentsProps> = ({
	priceData,
	setPriceData,
	handleSave,
}) => {
	return (
		<Container
			fluid
			className='mb-5'
		>
			<Row>
				<Col
					md={12}
					lg={12}
					style={{ paddingLeft: 0 }}
				>
					<ArtCostComponent
						artCostData={priceData.artCost}
						screenPrintingData={priceData.screenPrinting}
						setArtCostData={(updatedArtCost) => {
							setPriceData({
								...priceData,
								artCost: updatedArtCost,
							});
						}}
						setScreenPrintingData={(updatedScreenPrinting) => {
							setPriceData({
								...priceData,
								screenPrinting: updatedScreenPrinting,
							});
						}}
					/>
					<WholesaleMarkupComponent
						wholesaleMarkupData={priceData.wholesaleMarkup}
						setWholesaleMarkupData={(updatedWholesaleMarkup) => {
							setPriceData({
								...priceData,
								wholesaleMarkup: updatedWholesaleMarkup,
							});
						}}
					/>
					<PrintingQuantityRanges
						quantityRanges={priceData.printingQuantityRanges}
						setQuantityRanges={(updatedRanges) => {
							setPriceData({
								...priceData,
								printingQuantityRanges: updatedRanges,
							});
						}}
					/>
					<PrintingLocationNames
						printingLocationNames={priceData.printingLocationNames}
						setPrintingLocationNames={(updatedNames) => {
							setPriceData({
								...priceData,
								printingLocationNames: updatedNames,
							});
						}}
					/>
					<ScreenPrinting
						screenPrintingData={priceData.screenPrinting}
						setScreenPrintingData={(updatedScreenPrinting) => {
							setPriceData({
								...priceData,
								screenPrinting: updatedScreenPrinting,
							});
						}}
						printingQuantityRanges={priceData.printingQuantityRanges}
					/>
					<DTGPrintingComponent
						dtgPrintingData={priceData.dtgPrinting}
						setDTGPrintingData={(updatedDTGPrinting) => {
							setPriceData({
								...priceData,
								dtgPrinting: updatedDTGPrinting,
							});
						}}
						printingQuantityRanges={priceData.printingQuantityRanges}
					/>
					<DyeSublimation
						dyeSubData={priceData.dyeSublimation}
						setDyeSubData={(updatedDyeSubData) => {
							setPriceData({
								...priceData,
								dyeSublimation: updatedDyeSubData,
							});
						}}
						printingQuantityRanges={priceData.printingQuantityRanges}
					/>
					<PreCutVinyl
						preCutVinylData={priceData.preCutVinyl}
						setPreCutVinylData={(updatedPreCutVinylData) => {
							setPriceData({
								...priceData,
								preCutVinyl: updatedPreCutVinylData,
							});
						}}
						printingQuantityRanges={priceData.printingQuantityRanges}
					/>
					<Embroidery
						embroideryData={priceData.embroidery}
						setEmbroideryData={(updatedEmbroidery) => {
							setPriceData({
								...priceData,
								embroidery: updatedEmbroidery,
							});
						}}
					/>
					{/* Sticky Save Button */}
					<div className={styles.stickySaveButton}>
						<Button
							onClick={handleSave}
							variant='primary'
						>
							Save Changes
						</Button>
					</div>
				</Col>
			</Row>
		</Container>
	);
};

export default PricingComponents;
